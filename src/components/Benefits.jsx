import "./Benefits.css";

import { Zap, Percent, Heart, ShieldCheck } from "lucide-react";

function Benefits() {
  const benefits = [
    {
      icon: <Zap size={26} strokeWidth={1.8} />,
      title: "بيع بسهولة",
      text: "انشر منتجك ووصل لناس مهتمين بسرعة",
      className: "orange",
    },
    {
      icon: <Percent size={26} strokeWidth={1.8} />,
      title: "عمولة بسيطة",
      text: "نأخذ عمولة بسيطة عند إتمام عملية البيع",
      className: "orange",
    },
    {
      icon: <Heart size={26} strokeWidth={1.8} />,
      title: "دعم محلي",
      text: "منصة محلية لخدمة أهلنا في غزة",
      className: "purple",
    },
    {
      icon: <ShieldCheck size={26} strokeWidth={1.8} />,
      title: "شراء آمن",
      text: "تواصل مباشرة مع البائع واتفق بكل أمان",
      className: "purple",
    },
  ];

  return (
    <section className="benefits">
      <div className="benefits__container">
        {benefits.map((benefit, index) => (
          <div className="benefit-card" key={index}>
            <div className={`benefit-icon ${benefit.className}`}>
              {benefit.icon}
            </div>

            <div className="benefit-content">
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Benefits;
