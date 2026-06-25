// Card header colours by nation (national flag palettes).
export const COUNTRY_COLORS: Record<string, { bg: string; text: string }> = {
  Argentina: { bg: "bg-[#43A1D5]", text: "text-black" },
  Austria: { bg: "bg-[#ED2939]", text: "text-white" },
  Belgium: { bg: "bg-[#E30613]", text: "text-[#FDDA24]" },
  Brazil: { bg: "bg-[#FFFE00]", text: "text-[#002776]" },
  Canada: { bg: "bg-[#FF0000]", text: "text-white" },
  Colombia: { bg: "bg-[#FCD116]", text: "text-[#003893]" },
  Croatia: { bg: "bg-[#ED1C24]", text: "text-white" },
  Czechia: { bg: "bg-[#11457E]", text: "text-white" },
  Ecuador: { bg: "bg-[#FFD100]", text: "text-[#001489]" },
  Egypt: { bg: "bg-[#CE1126]", text: "text-white" },
  England: { bg: "bg-[#FAFAFA]", text: "text-[#00145A]" },
  France: { bg: "bg-[#002395]", text: "text-white" },
  Germany: { bg: "bg-white", text: "text-black" },
  Mexico: { bg: "bg-[#006847]", text: "text-white" },
  Morocco: { bg: "bg-[#C1272D]", text: "text-white" },
  Netherlands: { bg: "bg-[#F36C21]", text: "text-black" },
  Norway: { bg: "bg-[#BA0C2F]", text: "text-white" },
  Portugal: { bg: "bg-[#E42518]", text: "text-[#F1BF00]" },
  Scotland: { bg: "bg-[#0065BF]", text: "text-white" },
  Senegal: { bg: "bg-[#00853F]", text: "text-white" },
  "South Korea": { bg: "bg-[#C21A30]", text: "text-white" },
  Spain: { bg: "bg-[#AA151B]", text: "text-[#F1BF00]" },
  Sweden: { bg: "bg-[#FECC00]", text: "text-[#006AA7]" },
  Switzerland: { bg: "bg-[#FF0000]", text: "text-white" },
  Turkey: { bg: "bg-[#E30A17]", text: "text-white" },
  USA: { bg: "bg-[#002868]", text: "text-white" },
  Uruguay: { bg: "bg-[#7BCAE6]", text: "text-black" },
  DEFAULT: { bg: "bg-panel2", text: "text-ink" },
};

export function colorsFor(country: string) {
  return COUNTRY_COLORS[country] ?? COUNTRY_COLORS.DEFAULT;
}
