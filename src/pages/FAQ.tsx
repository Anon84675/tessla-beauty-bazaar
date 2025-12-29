import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/layout/CartSidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqData = [
  { category: "Orders", questions: [
    { q: "How do I place an order?", a: "Browse our products, add items to cart, and proceed to checkout. Select your payment method (M-Pesa or PayPal) and delivery location." },
    { q: "Can I modify my order after placing it?", a: "Contact us within 2 hours of placing your order and we'll do our best to accommodate changes." },
    { q: "How do I track my order?", a: "You'll receive tracking information via SMS and email once your order ships." },
  ]},
  { category: "Delivery", id: "delivery", questions: [
    { q: "What are the delivery options?", a: "We offer standard delivery (3-5 business days) and express delivery (1-2 business days) within Nairobi. Countrywide delivery takes 5-7 business days." },
    { q: "Is delivery free?", a: "Yes! Free delivery on orders over KSh 50,000. Orders below this have a small delivery fee based on location." },
    { q: "Do you deliver outside Kenya?", a: "Currently we deliver within Kenya only. Contact us for special arrangements to neighboring countries." },
  ]},
  { category: "Payments", questions: [
    { q: "What payment methods do you accept?", a: "We accept M-Pesa (Paybill & Till), PayPal, bank transfers, and cash on delivery for Nairobi orders." },
    { q: "Is my payment information secure?", a: "Absolutely. We use industry-standard encryption and never store your payment details." },
    { q: "Can I pay in installments?", a: "Yes, we offer payment plans for orders over KSh 50,000. Contact us for details." },
  ]},
  { category: "Returns & Refunds", id: "returns", questions: [
    { q: "What is your return policy?", a: "14-day return policy for unused items in original packaging. Contact us to initiate a return." },
    { q: "How long do refunds take?", a: "Refunds are processed within 5-7 business days after we receive the returned item." },
    { q: "What if my item arrives damaged?", a: "Contact us immediately with photos. We'll arrange a replacement or full refund at no extra cost." },
  ]},
];

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />
      <main className="flex-1">
        <section className="py-16 bg-gradient-hero">
          <div className="container text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Find answers to common questions about orders, delivery, payments, and returns.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-4xl">
            {faqData.map((section, idx) => (
              <motion.div key={section.category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} id={section.id} className="mb-10">
                <h2 className="font-serif text-2xl font-bold mb-4">{section.category}</h2>
                <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border overflow-hidden">
                  {section.questions.map((item, i) => (
                    <AccordionItem key={i} value={`${section.category}-${i}`} className="border-b border-border last:border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50">{item.q}</AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
