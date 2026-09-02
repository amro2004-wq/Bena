import "./HowItWorks.css";

import { PackagePlus, MessagesSquare, ShieldCheck } from "lucide-react";
function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "أضف منتجك",
      text: "صوّر المنتج، اكتب التفاصيل، حدد السعر والمنطقة.",
      icon: <PackagePlus size={30} strokeWidth={1.8} />,
    },
    {
      number: "2",
      title: "تواصل واتفق",
      text: "تواصل مع المشتري بسهولة واتفق على التفاصيل.",
      icon: <MessagesSquare size={30} strokeWidth={1.8} />,
    },
    {
      number: "3",
      title: "أتمم البيع",
      text: "قابل في المكان المتفق عليه وأتمم البيع بأمان.",
      icon: <ShieldCheck size={30} strokeWidth={1.8} />,
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      {" "}
      <h2>كيف تعمل بينا؟</h2>
      <div className="how-it-works__steps">
        {steps.map((step) => (
          <div className="step-card" key={step.number}>
            <div className="step-number">{step.number}</div>

            <div className="step-icon">{step.icon}</div>

            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
