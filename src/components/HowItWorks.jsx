import "./HowItWorks.css";

import { PackagePlus, MessagesSquare, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "أضف منتجك",
    text: "صوّر المنتج، اكتب التفاصيل، حدد السعر والمنطقة.",
    icon: PackagePlus,
  },
  {
    number: "2",
    title: "تواصل واتفق",
    text: "تواصل مع المشتري بسهولة واتفق على التفاصيل.",
    icon: MessagesSquare,
  },
  {
    number: "3",
    title: "أتمم البيع",
    text: "قابل في المكان المتفق عليه وأتمم البيع بأمان.",
    icon: ShieldCheck,
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="how-it-works"
      aria-labelledby="how-it-works-title"
    >
      {/* TITLE */}

      <h2 id="how-it-works-title">كيف تعمل بينا؟</h2>

      {/* STEPS */}

      <div className="how-it-works__steps">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <article className="step-card" key={step.number}>
              <div className="step-number" aria-hidden="true">
                {step.number}
              </div>

              <div className="step-icon" aria-hidden="true">
                <Icon size={30} strokeWidth={1.8} />
              </div>

              <div className="step-content">
                <h3>{step.title}</h3>

                <p>{step.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorks;
