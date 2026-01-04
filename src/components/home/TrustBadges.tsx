import { motion } from "framer-motion";
import { Truck, Shield, Headphones, CreditCard, RefreshCw, Award, ThumbsUp } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Instant Delivery",
    description: "For all orders"
  },
  {
    icon: ThumbsUp,
    title: "99% Satisfaction",
    description: "Customers Love Us"
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "24/7 customer service"
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "M-Pesa & PayPal accepted"
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "7-day return policy"
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description: "Premium brands only"
  }
];

const TrustBadges = () => {
  return (
    <section className="py-12 bg-gradient-hero border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
