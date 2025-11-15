"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateSiteConfig } from "@/actions/admin/site-config.actions";
import { Loader2 } from "lucide-react";

const siteConfigSchema = z.object({
  shippingCharge: z.number().min(0, "Shipping charge must be 0 or greater").nullable(),
  freeShippingMinOrder: z.number().min(0, "Minimum order value must be 0 or greater").nullable(),
  showAnnouncementBar: z.boolean(),
  announcementText: z.string().max(200, "Text is too long"),
});

type SiteConfigFormData = z.infer<typeof siteConfigSchema>;

interface SiteConfigFormProps {
  config: {
    id: string;
    shippingCharge: number | null;
    freeShippingMinOrder: number | null;
    showAnnouncementBar: boolean;
    announcementText: string;
  };
}

export function SiteConfigForm({ config }: SiteConfigFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SiteConfigFormData>({
    resolver: zodResolver(siteConfigSchema),
    defaultValues: {
      shippingCharge: config.shippingCharge,
      freeShippingMinOrder: config.freeShippingMinOrder,
      showAnnouncementBar: config.showAnnouncementBar,
      announcementText: config.announcementText,
    },
  });

  async function onSubmit(data: SiteConfigFormData) {
    setIsLoading(true);
    try {
      const result = await updateSiteConfig(data);

      if (result.success) {
        toast.success("Settings updated successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error) {
      toast.error("An error occurred while updating settings");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Shipping Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipping Settings</h3>

          <FormField
            control={form.control}
            name="shippingCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Charge (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty to disable shipping charges"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Shipping charge per order. Leave empty to disable shipping charges.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="freeShippingMinOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Free Shipping Minimum Order (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty to disable free shipping"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Orders above this amount get free shipping. Leave empty to disable free shipping.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Announcement Bar Settings */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">Announcement Bar</h3>

          <FormField
            control={form.control}
            name="showAnnouncementBar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Announcement Bar</FormLabel>
                  <FormDescription>Display announcement bar at the top of the site</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="announcementText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Announcement Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Free shipping on orders above ₹500!"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Text to display in the announcement bar (max 200 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isLoading}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
