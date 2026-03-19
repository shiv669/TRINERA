"use client";

import { ExternalLink } from "lucide-react";

export default function GovSchemes() {
  const schemes = [
    {
      title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      description:
        "Financial support of ₹6,000 per year in three equal installments to all landholding farmer families.",
      url: "https://pmkisan.gov.in/",
    },
    {
      title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      description:
        "Comprehensive crop insurance from pre-sowing to post-harvest against non-preventable natural risks.",
      url: "https://pmfby.gov.in/",
    },
    {
      title: "Soil Health Card Scheme",
      description:
        "Provides farmers with information on soil nutrient status and recommendations for crop-wise fertilizer dosage.",
      url: "https://soilhealth.dac.gov.in/",
    },
    {
      title: "Paramparagat Krishi Vikas Yojana (PKVY)",
      description:
        "Promotes organic farming through a cluster approach and Participatory Guarantee System certification.",
      url: "https://pgsindia-ncof.gov.in/PKVY/Index.aspx",
    },
    {
      title: "Agricultural Infrastructure Fund (AIF)",
      description:
        "Financing facility for investment in viable projects for post-harvest management infrastructure.",
      url: "https://agriinfra.dac.gov.in/",
    },
    {
      title: "National Agriculture Market (e-NAM)",
      description:
        "Pan-India electronic trading portal networking existing APMC mandis to create a unified national market.",
      url: "https://enam.gov.in/web/",
    },
    {
      title: "Kisan Credit Card (KCC)",
      description:
        "Provides farmers with timely access to credit for agricultural and allied activities at affordable rates.",
      url: "https://www.pmkisan.gov.in/KisanCreditCard",
    },
    {
      title: "Rashtriya Krishi Vikas Yojana (RKVY)",
      description:
        "Incentivizes states to increase public investment in agriculture and allied sectors.",
      url: "https://rkvy.nic.in/",
    },
  ];

  return (
    <section id="schemes" className="py-20 bg-[#F4F9F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Government Agriculture Schemes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and apply for financial assistance, insurance, and resources provided by the government to support your farming journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {schemes.map((scheme, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#2D5A27] flex flex-col h-full ring-1 ring-gray-100"
            >
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {scheme.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  {scheme.description}
                </p>
                <div className="mt-auto">
                  <a
                    href={scheme.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2D5A27] font-medium flex items-center gap-1 hover:gap-2 transition-all w-full group"
                  >
                    View Details
                    <ExternalLink className="w-4 h-4 transition-transform text-[#2D5A27]" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a
            href="https://agriwelfare.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border-2 border-[#2D5A27] text-[#2D5A27] font-semibold rounded-lg hover:bg-[#2D5A27] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            View All Schemes
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
