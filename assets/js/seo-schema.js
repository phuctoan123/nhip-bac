/* Shared structured data for public pages. The home page already carries a static copy. */
(function () {
  if (document.querySelector('script[type="application/ld+json"]')) return;
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": "https://nhipbac.com/#business",
    name: "Nhíp Bạc",
    url: "https://nhipbac.com/",
    image: "https://nhipbac.com/assets/nhip-bac-images/logo.jpg",
    telephone: ["+84934013486", "+84356735783"],
    priceRange: "2.000 VND/phút",
    address: {
      "@type": "PostalAddress",
      streetAddress: "12 Hưng Gia 4",
      addressLocality: "Phường Tân Hưng, Quận 7",
      addressRegion: "TP.HCM",
      addressCountry: "VN",
    },
    geo: { "@type": "GeoCoordinates", latitude: 10.7324795, longitude: 106.7080122 },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "10:00",
      closes: "18:00",
    },
    areaServed: ["Phú Mỹ Hưng", "Quận 7", "TP.HCM"],
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
})();
