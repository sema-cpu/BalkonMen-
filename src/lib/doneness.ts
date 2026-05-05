import type { Locale } from "@/i18n/config"
import type { DonenessRating } from "@/types/menu"

type DonenessOption = {
  value: DonenessRating
  temperature: string
  labels: Record<Locale, string>
  descriptions: Record<Locale, string>
}

const donenessOptions: DonenessOption[] = [
  {
    value: "rare",
    temperature: "50-52 C",
    labels: { tr: "Az Pismis" },
    descriptions: { tr: "Kirmizi merkez, yumusak doku" }
  },
  {
    value: "mediumRare",
    temperature: "54-57 C",
    labels: { tr: "Orta Az" },
    descriptions: { tr: "Sicak pembe merkez, sulu bitis" }
  },
  {
    value: "medium",
    temperature: "60-63 C",
    labels: { tr: "Orta" },
    descriptions: { tr: "Pembe merkez, dengeli pisme" }
  },
  {
    value: "mediumWell",
    temperature: "65-68 C",
    labels: { tr: "Orta Iyi" },
    descriptions: { tr: "Hafif pembe, daha sik doku" }
  },
  {
    value: "wellDone",
    temperature: "70 C+",
    labels: { tr: "Iyi Pismis" },
    descriptions: { tr: "Tam pismis, sik ve net bitis" }
  }
]

const isDonenessRating = (value: unknown): value is DonenessRating => {
  return typeof value === "string" && donenessOptions.some((option) => option.value === value)
}

const getDonenessOption = (value: DonenessRating) => {
  return donenessOptions.find((option) => option.value === value)
}

const getDonenessLabel = (value: DonenessRating, locale: Locale) => {
  return getDonenessOption(value)?.labels[locale] ?? value
}

export { donenessOptions, getDonenessLabel, getDonenessOption, isDonenessRating }
