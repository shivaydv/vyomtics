"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Section {
  type: "bullets" | "specs" | "text";
  title: string;
  items?: string[] | { key: string; value: string }[];
  content?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ProductTabsProps {
  description: string | null;
  sections: Section[];
  faqs: FAQ[];
}

export function ProductTabs({ description, sections, faqs }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
        >
          Description
        </TabsTrigger>
        {sections.length > 0 && (
          <TabsTrigger
            value="specifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
          >
            Specifications
          </TabsTrigger>
        )}
        {faqs.length > 0 && (
          <TabsTrigger
            value="faq"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
          >
            FAQ
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose max-w-none">
          {description ? (
            <p className="text-gray-700 leading-relaxed">{description}</p>
          ) : (
            <p className="text-gray-500">No description available</p>
          )}
        </div>
      </TabsContent>

      {sections.length > 0 && (
        <TabsContent value="specifications" className="mt-6 space-y-8">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-xl font-semibold mb-4">{section.title}</h3>

              {section.type === "bullets" && Array.isArray(section.items) && (
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {(section.items as string[]).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {section.type === "specs" && Array.isArray(section.items) && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {(section.items as { key: string; value: string }[]).map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3">
                            {item.key}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.type === "text" && section.content && (
                <div className="text-gray-700 leading-relaxed">{section.content}</div>
              )}
            </div>
          ))}
        </TabsContent>
      )}

      {faqs.length > 0 && (
        <TabsContent value="faq" className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      )}
    </Tabs>
  );
}
