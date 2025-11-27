"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/utils/format";
import { Loader2, CheckCircle2, MapPin, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PhoneInput } from "@/components/ui/phone-input";
import Script from "next/script";
import { checkoutFormSchema, type CheckoutFormData } from "@/lib/zod-schema";
import { z } from "zod";
import { validateCoupon } from "@/actions/admin/coupon.actions";
import { initiateOrder } from "@/actions/payment/initiate-order";
import { confirmOrder } from "@/actions/payment/confirm-order";
import { DeletePendingOrder } from "@/actions/payment/delete-pending-order";
import { FailedOrder } from "@/actions/payment/failed-order";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  isDefault: boolean;
}

interface CheckoutFormProps {
  userEmail: string | undefined;
  savedAddresses: SavedAddress[];
}

export function CheckoutForm({ userEmail, savedAddresses }: CheckoutFormProps) {
  const router = useRouter();
  const { items, getSubtotal, getShipping, clearCart, isLoading, isInitialized } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCouponApplying, setIsCouponApplying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "initiating" | "verifying" | "success"
  >("idle");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const defaultAddress = savedAddresses.find((addr) => addr.isDefault);
    return defaultAddress
      ? defaultAddress.id
      : savedAddresses.length > 0
      ? savedAddresses[0].id
      : "new";
  });

  // Form state - Initialize with default/first address if available
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    const defaultAddress = savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];

    if (defaultAddress) {
      return {
        firstName: defaultAddress.firstName,
        lastName: defaultAddress.lastName,
        phone: defaultAddress.phone,
        email: defaultAddress.email || userEmail || "",
        address: defaultAddress.address,
        apartment: defaultAddress.apartment || "",
        country: defaultAddress.country,
        state: defaultAddress.state,
        city: defaultAddress.city,
        pinCode: defaultAddress.pinCode,
        coupon: "",
      };
    }

    return {
      firstName: "",
      lastName: "",
      phone: "",
      email: userEmail || "",
      address: "",
      apartment: "",
      country: "India",
      state: "",
      city: "",
      pinCode: "",
      coupon: "",
    };
  });

  // Show loading state while cart is initializing
  if (!isInitialized || isLoading) {
    return <div>Loading...</div>;
  }

  // Show empty cart if no items - moved after all hooks
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-muted p-6 mb-4 inline-block">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to your cart to checkout</p>
          <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);

    if (addressId === "new") {
      // Clear form for new address
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: userEmail || "",
        address: "",
        apartment: "",
        country: "India",
        state: "",
        city: "",
        pinCode: "",
        coupon: formData.coupon, // Keep coupon
      });
    } else {
      // Pre-fill form with selected address
      const address = savedAddresses.find((addr) => addr.id === addressId);
      if (address) {
        setFormData((prev) => ({
          ...prev,
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          email: address.email || prev.email,
          address: address.address,
          apartment: address.apartment || "",
          city: address.city,
          state: address.state,
          pinCode: address.pinCode,
          country: address.country,
        }));
      }
    }
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    try {
      checkoutFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof CheckoutFormData;
          if (!fieldErrors[field]) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors in the form");
      }
      return false;
    }
  };

  const handleApplyCoupon = async () => {
    if (!formData.coupon || formData.coupon.trim() === "") {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsCouponApplying(true);
    try {
      const result = await validateCoupon(formData.coupon, getSubtotal(), undefined);

      if (result.success && result.data) {
        setAppliedCoupon({
          code: result.data.code,
          discount: result.data.discount,
        });
        toast.success(
          `Coupon "${result.data.code}" applied! You saved ${formatPrice(result.data.discount)}`
        );
      } else {
        toast.error(result.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to validate coupon. Please try again.");
    } finally {
      setIsCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setFormData((prev) => ({ ...prev, coupon: "" }));
    toast.success("Coupon removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Auto-clear coupon if typed but not applied
    if (formData.coupon && formData.coupon.trim() !== "" && !appliedCoupon) {
      setFormData((prev) => ({ ...prev, coupon: "" }));
      toast.info("Unapplied coupon code was cleared");
    }

    setIsProcessing(true);
    setPaymentStatus("initiating");

    try {
      const addressDetails = {
        country: formData.country,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        apartment: formData.apartment || undefined,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        phone: formData.phone,
        email: formData.email || undefined,
      };

      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const orderData = {
        couponCode: appliedCoupon?.code || undefined,
        items: orderItems,
        shippingAddress: addressDetails,
        billingAddress: addressDetails,
      };

      const res = await initiateOrder(orderData);

      if (!res.success || !res.data) {
        throw new Error("Failed to initiate payment");
      }

      const { orderId, razorpayOrderId, key, amount } = res.data;

      let paymentAttempted = false;

      const options = {
        key,
        amount: amount * 100,
        order_id: razorpayOrderId,
        retry: false,
        handler: async (response: any) => {
          try {
            paymentAttempted = true;
            setPaymentStatus("verifying");
            const result = await confirmOrder({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (result.success) {
              setPaymentStatus("success");
              toast.success("Payment successful!", { id: "payment" });
              clearCart();
              router.push("/account/orders");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error: any) {
            console.error("Error confirming order:", error);
            toast.error("Payment verification failed. Please contact support.", {
              id: "payment",
            });
            setPaymentStatus("idle");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            if (!paymentAttempted) {
              console.log("User cancelled payment before attempting - deleting order");
              const result = await DeletePendingOrder(orderId);
              if (result.success) {
                toast.error("Payment cancelled", { id: "payment" });
              } else {
                toast.error("Payment cancelled", { id: "payment" });
              }
            } else {
              console.log("Payment was attempted - keeping order for records");
              toast.error("Payment window closed. Check your orders for status.", {
                id: "payment",
              });
            }
            setPaymentStatus("idle");
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async function (response: any) {
        paymentAttempted = true;
        console.log("Payment failed, marking order as FAILED");
        await FailedOrder(orderId);
        toast.error("Payment failed.", { id: "payment" });
        setPaymentStatus("idle");
        setIsProcessing(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Error processing order:", error);
      // Show user-friendly error message, not technical details
      const userMessage =
        error.message && !error.message.includes("digest")
          ? error.message
          : "Unable to process your order. Please try again or contact support.";
      toast.error(userMessage, { id: "payment" });
      setPaymentStatus("idle");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[1fr_480px] gap-8">
          {/* Left Column - Delivery Form */}
          <div className="space-y-6">
            {/* Saved Addresses Section */}
            {savedAddresses.length > 0 && (
              <Card className="p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Select Delivery Address</h2>
                </div>

                <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelect}>
                  <div className="space-y-3">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleAddressSelect(address.id)}
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {address.firstName} {address.lastName}
                            </p>
                            {address.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.address}
                            {address.apartment && `, ${address.apartment}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.pinCode}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                        </Label>
                      </div>
                    ))}

                    {/* Use New Address Option */}
                    <div
                      className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                        selectedAddressId === "new"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => handleAddressSelect("new")}
                    >
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new" className="flex-1 cursor-pointer">
                        <p className="font-medium">Use a new address</p>
                        <p className="text-sm text-muted-foreground">
                          Enter a new delivery address below
                        </p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </Card>
            )}

            {/* Delivery Form */}
            <Card className="p-6 space-y-2">
              <h2 className="text-xl font-semibold">
                {selectedAddressId === "new" || savedAddresses.length === 0
                  ? "Delivery Address"
                  : "Edit Delivery Details"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedAddressId !== "new" && savedAddresses.length > 0
                  ? "You can edit the selected address details below"
                  : "Enter your delivery information"}
              </p>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <PhoneInput
                    id="phone"
                    value={formData.phone}
                    defaultCountry="IN"
                    onChange={(value) => handleInputChange("phone", value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              {/* Country/Region */}
              <div className="space-y-2">
                <Label htmlFor="country">Country/Region</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  defaultValue={"India"}
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="House number and street name"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>

              {/* Apartment */}
              <div className="space-y-2">
                <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                <Input
                  id="apartment"
                  value={formData.apartment}
                  onChange={(e) => handleInputChange("apartment", e.target.value)}
                />
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN code</Label>
                  <Input
                    id="pinCode"
                    value={formData.pinCode}
                    onChange={(e) => handleInputChange("pinCode", e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-8 h-full space-y-6">
            <Card className="p-4 sm:p-6 space-y-2">
              {/* Cart Items */}
              <div className="space-y-2 max-h-[300px] sm:max-h-none overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 sm:gap-4">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg border overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 640px) 48px, 64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="" />

              {/* Coupon */}
              {appliedCoupon ? (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Discount: {formatPrice(appliedCoupon.discount)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={formData.coupon}
                      onChange={(e) => handleInputChange("coupon", e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      disabled={isCouponApplying}
                    />
                    <Button
                      type="button"
                      variant="default"
                      className="shrink-0"
                      onClick={handleApplyCoupon}
                      disabled={isCouponApplying || !formData.coupon}
                    >
                      {isCouponApplying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Separator className="" />

              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal • {items.length} item{items.length > 1 ? "s" : ""}
                  </span>
                  <span className="font-medium">{formatPrice(getSubtotal())}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Discount ({appliedCoupon.code})</span>
                    <span className="font-medium">-{formatPrice(appliedCoupon.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span className="font-medium">
                    {getShipping() === 0 ? "FREE" : formatPrice(getShipping())}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-base font-semibold pt-2">
                  <span>Total</span>
                  <span>
                    {formatPrice(getSubtotal() - (appliedCoupon?.discount || 0) + getShipping())}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                size="lg"
              >
                {paymentStatus === "initiating" && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initiating Payment...
                  </>
                )}
                {paymentStatus === "verifying" && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Payment...
                  </>
                )}
                {paymentStatus === "success" && (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Success! Redirecting...
                  </>
                )}
                {paymentStatus === "idle" && "Pay Now"}
              </Button>
            </Card>
          </div>
        </div>
      </form>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
}
