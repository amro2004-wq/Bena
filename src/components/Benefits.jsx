import "./Benefits.css";

import { Zap, Percent, Heart, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "بيع بسهولة",
    text: "انشر منتجك ووصل لناس مهتمين بسرعة",
    className: "orange",
  },
  {
    icon: Percent,
    title: "عمولة بسيطة",
    text: "نأخذ عمولة بسيطة عند إتمام عملية البيع",
    className: "orange",
  },
  {
    icon: Heart,
    title: "دعم محلي",
    text: "منصة محلية لخدمة أهلنا في غزة",
    className: "purple",
  },
  {
    icon: ShieldCheck,
    title: "شراء آمن",
    text: "تواصل مباشرة مع البائع واتفق بكل أمان",
    className: "purple",
  },
];

function Benefits() {
  return (
    <section className="benefits" aria-label="مميزات بينا">
      <div className="benefits__container">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article className="benefit-card" key={benefit.title}>
              <div
                className={`benefit-icon ${benefit.className}`}
                aria-hidden="true"
              >
                <Icon size={26} strokeWidth={1.8} />
              </div>

              <div className="benefit-content">
                <h3>{benefit.title}</h3>

                <p>{benefit.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Benefits;
