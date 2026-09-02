import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Benefits from "../components/Benefits";
import Categories from "../components/Categories";
import LatestProducts from "../components/LatestProducts";
import HowItWorks from "../components/HowItWorks";
import PromoBanners from "../components/PromoBanners";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Benefits />
      <Categories />
      <LatestProducts />
      <HowItWorks />
      <PromoBanners />
      <Newsletter />
      <Footer />
    </>
  );
}

export default Home;
