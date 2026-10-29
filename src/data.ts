import { museumResources } from "./museum-resources.ts"
import { museumContent } from "./museum-content.ts"
import { enrichment } from "./enrichment.ts"
import { photoEnrichment } from "./photo-enrichment.ts"

export type MuseumType = "Museo" | "Sala de exhibición" | "Lugar de memoria" | "Templo museo" | "Museo universitario"

export type SourceId = "2026" | "guia2023" | "rutas" | "extra"

export type MuseumResource = { kind: "tour" | "collection" | "video" | "audio" | "guide"; title: string; url: string; source: string; scope?: string; checkedAt: string }

export type Museum = {
  resources?: MuseumResource[]
  id: string
  themes?: string[]
  story?: string
  storySource?: string
  highlights?: { title: string; text: string }[]
  sources?: { label: string; url: string }[]
  description?: string
  descriptionSource?: string
  addressSource?: string
  verifiedAt?: string
  image?: {
    src: string
    alt: string
    author: string
    license: string
    licenseUrl: string
    source: string
    changes: string
  }
  department: string
  city: string
  name: string
  address: string
  source: SourceId
  type: MuseumType
  officialUrl?: string
  virtualUrl?: string
}

export const sourceUrls: Record<SourceId, string> = {
  "2026":
    "https://museos.cultura.pe/sites/default/files/item/archivo/LISTA%20DE%20MUSEOS%20ABIERTOS%20FEBRERO.pdf",
  guia2023:
    "https://museos.cultura.pe/sites/default/files/publicaciones/pdf/Guia%20museos%20e%20instituciones%20museales%202023%20web_0.pdf",
  rutas:
    "https://museos.cultura.pe/sites/default/files/publicaciones/pdf/rutasinterregionalesdemuseos.pdf",
  extra: "https://museos.cultura.pe/museos-publicos-y-privados",
}

export const sourceLabels: Record<SourceId, string> = {
  "2026": "Listado oficial, febrero de 2026",
  guia2023: "Guía de museos e instituciones museales 2023",
  rutas: "Rutas interregionales de museos",
  extra: "Directorio de museos públicos y privados",
}

const rawMuseums: Array<Omit<Museum, "type" | "id">> = [
  {
    department: "Amazonas",
    city: "Chachapoyas",
    name: "Sala de Exhibición Gilberto Tenorio Ruiz",
    address: "Jr. Ayacucho 904, Chachapoyas",
    source: "2026",
  },
  {
    department: "Áncash",
    city: "Huaraz",
    name: "Museo Arqueológico de Áncash Augusto Soriano Infante",
    address: "Av. Luzuriaga 762, Huaraz",
    source: "2026",
  },
  {
    department: "Áncash",
    city: "Cabana",
    name: "Museo Arqueológico Zonal de Cabana",
    address: "Plaza de Armas s/n, Cabana, Pallasca",
    source: "2026",
  },
  {
    department: "Áncash",
    city: "Ranrahirca",
    name: "Museo de Antropología, Arqueología e Historia Natural de Ranrahirca",
    address: "Jr. Las Palmeras s/n, Ranrahirca, Yungay",
    source: "2026",
  },
  {
    department: "Áncash",
    city: "Chavín de Huántar",
    name: "Museo Nacional Chavín",
    address:
      "Av. 17 de Enero, Prolongación Norte s/n, Chavín de Huántar, Huari",
    source: "2026",
    virtualUrl:
      "https://visitavirtual.cultura.pe/recorridos/MUNACH/museo-nacional-chavin/index.html",
  },
  {
    department: "Áncash",
    city: "Casma",
    name: "Museo Regional de Casma Max Uhle",
    address: "Carretera Casma-Huaraz km 1.5, Casma",
    source: "2026",
  },
  {
    department: "Áncash",
    city: "Independencia",
    name: "Sala de Exhibición del Monumento Arqueológico Willkawaín",
    address: "Centro Poblado Menor de Paria, Independencia, Huaraz",
    source: "2026",
  },
  {
    department: "Apurímac",
    city: "Abancay",
    name: "Museo Arqueológico y Antropológico de Apurímac",
    address: "Casa Hacienda Illanya s/n, Abancay",
    source: "2026",
  },
  {
    department: "Ayacucho",
    city: "Quinua",
    name: "Museo de Sitio de Quinua",
    address: "Plaza Principal de Quinua 308, Quinua, Huamanga",
    source: "2026",
  },
  {
    department: "Ayacucho",
    city: "Pacaycasa",
    name: "Museo de Sitio Wari",
    address: "Carretera Ayacucho-Quinua km 23, Pacaycasa, Huamanga",
    source: "2026",
  },
  {
    department: "Ayacucho",
    city: "Ayacucho",
    name: "Museo Histórico Regional Hipólito Unanue",
    address: "Av. Independencia 502, Ayacucho",
    source: "2026",
  },
  {
    department: "Cajamarca",
    city: "Cajamarca",
    name: "Museo Arqueológico y Etnográfico del Conjunto Monumental Belén",
    address: "Jr. Belén 571, Conjunto Monumental Belén, Cajamarca",
    source: "2026",
  },
  {
    department: "Callao",
    city: "Callao",
    name: "Salas de Exhibición de la DDC Callao",
    address: "Jr. Salaverry 208, Cercado del Callao",
    source: "2026",
  },
  {
    department: "Cusco",
    city: "Quillabamba",
    name: "Museo Amazónico Andino Qhapaq Ñan Quillabamba",
    address: "Jr. Timpia cruce con Av. 25 de Julio, Urb. La Granja, Santa Ana",
    source: "2026",
  },
  {
    department: "Cusco",
    city: "Paucartambo",
    name: "Museo de los Pueblos de Paucartambo",
    address: "Plaza Kukuli s/n, Paucartambo",
    source: "2026",
  },
  {
    department: "Cusco",
    city: "Machupicchu",
    name: "Museo de Sitio Manuel Chávez Ballón",
    address: "Altura del Antiguo Puente Ruinas, km 112 vía férrea, Machupicchu",
    source: "2026",
  },
  {
    department: "Cusco",
    city: "Chinchero",
    name: "Museo de Sitio de Chinchero",
    address: "Plaza Principal del Pueblo de Chinchero, Urubamba",
    source: "2026",
  },
  {
    department: "Cusco",
    city: "Cusco",
    name: "Museo Histórico Regional de Cusco",
    address:
      "Calle Garcilaso con Heladeros s/n, Casa del Inca Garcilaso de la Vega, Cusco",
    source: "2026",
  },
  {
    department: "Huancavelica",
    city: "Huaytará",
    name: "Museo Arqueológico Samuel Humberto Espinoza Lozano",
    address: "Jr. 24 de Junio s/n, Huaytará",
    source: "2026",
  },
  {
    department: "Huancavelica",
    city: "Huancavelica",
    name: "Museo Regional Daniel Hernández Morillo",
    address: "Jr. Antonio Raimondi 193, Huancavelica",
    source: "2026",
  },
  {
    department: "Huánuco",
    city: "Huánuco",
    name: "Sala de Exhibición de la Zona Arqueológica Monumental de Kotosh",
    address: "Carretera Huánuco-La Unión km 5, Huánuco",
    source: "2026",
  },
  {
    department: "Ica",
    city: "Paracas",
    name: "Museo de Sitio Julio C. Tello de Paracas",
    address:
      "Carretera Pisco-Puerto San Martín km 27, Reserva Nacional de Paracas",
    source: "2026",
  },
  {
    department: "Ica",
    city: "Ica",
    name: "Museo Regional de Ica Adolfo Bermúdez Jenkins",
    address: "Av. Ayabaca 895, Urb. San Isidro, Ica",
    source: "2026",
  },
  {
    department: "Ica",
    city: "Humay",
    name: "Sala de Exhibición del Sitio Arqueológico Tambo Colorado",
    address: "Vía Los Libertadores Wari km 39, Humay, Pisco",
    source: "2026",
  },
  {
    department: "Junín",
    city: "Huancán",
    name: "Museo de Sitio de Wariwillka",
    address: "Plaza Principal del Centro Poblado de Huari, Huancán, Huancayo",
    source: "2026",
  },
  {
    department: "Junín",
    city: "Chupaca",
    name: "Museo Regional de Arqueología de Junín",
    address: "Jr. Grau 195, Chupaca",
    source: "2026",
  },
  {
    department: "La Libertad",
    city: "Trujillo",
    name: "Museo de Sitio de Chan Chan",
    address: "Av. Chan Chan s/n, carretera a Huanchaco, Trujillo",
    source: "2026",
  },
  {
    department: "La Libertad",
    city: "Magdalena de Cao",
    name: "Museo Cao",
    address: "Magdalena de Cao, Ascope",
    source: "2026",
  },
  {
    department: "Lambayeque",
    city: "Lambayeque",
    name: "Museo Arqueológico Nacional Brüning",
    address: "Av. Huamachuco s/n, Lambayeque",
    source: "2026",
  },
  {
    department: "Lambayeque",
    city: "San José",
    name: "Museo de Sitio Huaca Chotuna - Chornancap",
    address: "Huaca Chotuna, sector Bodegones, San José",
    source: "2026",
  },
  {
    department: "Lambayeque",
    city: "Saña",
    name: "Museo de Sitio Huaca Rajada - Sipán",
    address:
      "Campiña Huaca Rajada s/n, carretera Sipán-Pampa Grande, Saña, Chiclayo",
    source: "2026",
  },
  {
    department: "Lambayeque",
    city: "Túcume",
    name: "Museo Túcume",
    address: "Campiña de San Antonio s/n, Túcume",
    source: "2026",
  },
  {
    department: "Lambayeque",
    city: "Ferreñafe",
    name: "Museo Nacional de Sicán",
    address: "Av. Batán Grande 1000, Carretera Pítipo, Ferreñafe",
    source: "2026",
  },
  {
    department: "Lambayeque",
    city: "Lambayeque",
    name: "Museo Tumbas Reales de Sipán",
    address: "Av. Juan Pablo Vizcardo y Guzmán 895, Lambayeque",
    source: "2026",
  },
  {
    department: "Lima",
    city: "Lima",
    name: "Museo José Carlos Mariátegui",
    address: "Jr. Washington 1946, Lima",
    source: "2026",
    virtualUrl:
      "https://visitavirtual.cultura.pe/recorridos/CMJM/casa-museo-jose-carlos-mariategui/index.html",
  },
  {
    department: "Lima",
    city: "Miraflores",
    name: "Lugar de la Memoria, la Tolerancia y la Inclusión Social",
    address: "Bajada San Martín 151, Miraflores",
    source: "2026",
  },
  {
    department: "Lima",
    city: "Lima",
    name: "Museo de Arte Italiano",
    address: "Paseo de la República 250, Lima",
    source: "2026",
  },
  {
    department: "Lima",
    city: "Ate",
    name: "Museo de Sitio Arturo Jiménez Borja - Puruchuco",
    address: "Av. Prolongación Javier Prado Este cuadra 85, Ate",
    source: "2026",
  },
  {
    department: "Lima",
    city: "Rímac",
    name: "Museo de Sitio El Mirador Cerro San Cristóbal",
    address: "Mirador del Cerro San Cristóbal, Rímac",
    source: "2026",
  },
  {
    department: "Lima",
    city: "Miraflores",
    name: "Museo de Sitio Pucllana",
    address: "Calle General Borgoño cuadra 8 s/n, Miraflores",
    source: "2026",
  },
  {
    department: "Lima",
    city: "San Isidro",
    name: "Museo de Sitio Huallamarca",
    address: "Av. Nicolás de Ribera 201, San Isidro",
    source: "2026",
  },
  {
    department: "Lima",
    city: "Lurín",
    name: "Museo Pachacamac",
    address: "Antigua carretera Panamericana Sur km 31.5, Lurín",
    source: "2026",
    virtualUrl:
      "https://visitavirtual.cultura.pe/recorridos/MSPAC/museo-sitio-pachacamac/index.html",
  },
  {
    department: "Lima",
    city: "Pueblo Libre",
    name: "Museo Nacional de Arqueología, Antropología e Historia del Perú",
    address: "Plaza Bolívar s/n, Pueblo Libre",
    source: "2026",
  },
  {
    department: "Lima",
    city: "Lima",
    name: "Museo Nacional de la Cultura Peruana",
    address: "Av. Alfonso Ugarte 650, Lima",
    source: "2026",
    officialUrl:
      "https://museos.cultura.pe/museos/museo-nacional-de-la-cultura-peruana",
  },
  {
    department: "Lima",
    city: "Lima",
    name: "Museo Electoral y de la Democracia",
    address: "Av. Nicolás de Piérola 1080, Lima",
    source: "2026",
  },
  {
    department: "Lima",
    city: "Lima",
    name: "Museo Gráfico El Peruano",
    address: "Jr. Quilca 556, Lima",
    source: "2026",
  },
  {
    department: "Loreto",
    city: "Iquitos",
    name: "Museo Amazónico",
    address: "Malecón Tarapacá 386, Iquitos, Maynas",
    source: "2026",
    officialUrl: "https://museos.cultura.pe/museos/museo-amaz%C3%B3nico",
  },
  {
    department: "Piura",
    city: "Catacaos",
    name: "Museo de Sitio de Narihualá",
    address: "Calle Olmos s/n, Centro Poblado de Narihualá, Catacaos",
    source: "2026",
    officialUrl:
      "https://museos.cultura.pe/museos/museo-de-sitio-de-narihual%C3%A1",
  },
  {
    department: "Piura",
    city: "Piura",
    name: "Sala de Oro del Museo Municipal Vicús",
    address: "Av. Sullana con Jr. Huánuco s/n, Cercado de Piura",
    source: "2026",
    officialUrl:
      "https://museos.cultura.pe/museos/sala-de-oro-del-museo-municipal-vic%C3%BAs",
  },
  {
    department: "Puno",
    city: "Pucará",
    name: "Museo Lítico de Pukara",
    address: "Jr. Lima 102, Pucará, Lampa",
    source: "2026",
    officialUrl: "https://museos.cultura.pe/museos/museo-l%C3%ADtico-de-pukara",
    virtualUrl:
      "https://visitavirtual.cultura.pe/recorridos/MLP/museo-litico-pukara/index.html",
  },
  {
    department: "Puno",
    city: "Juli",
    name: "Templo Museo Nuestra Señora de la Asunción",
    address: "Jr. Asunción s/n, Juli, Chucuito",
    source: "2026",
  },
  {
    department: "Puno",
    city: "Juli",
    name: "Templo Museo San Juan de Letrán",
    address: "Jr. Juli 352, Juli, Chucuito",
    source: "2026",
  },
  {
    department: "San Martín",
    city: "Moyobamba",
    name: "Museo Departamental San Martín",
    address: "Jr. Benavides 380, Barrio Calvario, Moyobamba",
    source: "2026",
    virtualUrl:
      "https://visitavirtual.cultura.pe/recorridos/MDSM/museo-departamental-san-martin/index.html",
  },
  {
    department: "Tumbes",
    city: "Corrales",
    name: "Museo de Sitio de Cabeza de Vaca Gran Chilimasa",
    address: "Calle El Museo 117, Cabeza de Vaca Sur, Corrales",
    source: "2026",
  },
  {
    department: "Arequipa",
    city: "Arequipa",
    name: "Museo de la Catedral de Arequipa",
    address: "Plaza de Armas s/n, Arequipa",
    source: "guia2023",
  },
  {
    department: "Moquegua",
    city: "Moquegua",
    name: "Museo Contisuyo",
    address: "Jr. Tacna 294, Plaza de Armas, Moquegua",
    source: "extra",
  },
  {
    department: "Pasco",
    city: "Pozuzo",
    name: "Museo Schafferer",
    address: "Av. Los Colonos 220, Pozuzo, Oxapampa",
    source: "guia2023",
  },
  {
    department: "Madre de Dios",
    city: "Puerto Maldonado",
    name: "Sala de Exhibición de Patrimonio Cultural Material e Inmaterial de Madre de Dios",
    address: "Jr. Gonzales Prada 222, Tambopata, Puerto Maldonado",
    source: "guia2023",
  },
  {
    department: "Ucayali",
    city: "Pucallpa",
    name: "Museo Regional de Ucayali Zoológico Parque Natural de Pucallpa",
    address: "Carretera Federico Basadre km 4, Callería, Coronel Portillo",
    source: "guia2023",
  },
  {
    department: "Tacna",
    city: "Tacna",
    name: "Museo Histórico Regional de Tacna",
    address: "Av. Apurímac 202, Tacna",
    source: "rutas",
    virtualUrl:
      "https://visitavirtual.cultura.pe/recorridos/MHRT/museo-historico-regional-tacna/index.html",
  },
  {
    department: "Tacna",
    city: "Pocollay",
    name: "Museo de Sitio Las Peañas",
    address: "Av. Jorge Basadre Grohmann s/n, Pago Peañas, Pocollay",
    source: "rutas",
  },
  {
    department: "Callao",
    city: "Callao",
    name: "Museo del Ejército Fortaleza Real Felipe",
    address: "Plaza Independencia, Callao",
    source: "extra",
  },
  {
    department: "Puno",
    city: "Puno",
    name: "Museo Municipal Carlos Dreyer",
    address: "Jr. Deustua, Puno",
    source: "guia2023",
  },
  {
    department: "Puno",
    city: "Puno",
    name: "Museo Antropológico de la Escuela Profesional de Antropología - UNA Puno",
    address: "Av. Floral 1153, Ciudad Universitaria, Puno",
    source: "guia2023",
  },
  {
    department: "Loreto",
    city: "Iquitos",
    name: "Museo de Culturas Indígenas Amazónicas",
    address: "Malecón Tarapacá 332, Iquitos",
    source: "guia2023",
  },
  {
    department: "Lima",
    city: "Lima",
    name: "Museo Central MUCEN",
    address: "Esquina Jr. Ucayali y Jr. Lampa, Lima",
    source: "extra",
    officialUrl: "https://museos.cultura.pe/museos/museo-central-mucen",
  },
]

function inferType(name: string): MuseumType {
  if (name.includes("UNA Puno")) return "Museo universitario"
  if (name.startsWith("Lugar de la Memoria")) return "Lugar de memoria"
  if (name.startsWith("Templo Museo")) return "Templo museo"
  if (name.startsWith("Sala") || name.startsWith("Salas"))
    return "Sala de exhibición"
  return "Museo"
}

export const museums: Museum[] = rawMuseums.map((museum) => ({
  ...museum,
  ...photoEnrichment[museum.name],
  ...enrichment[museum.name],
  ...museumContent[museum.name],
  ...museumResources[museum.name],
  virtualUrl: museumResources[museum.name]?.resources.find(r => r.kind === "tour")?.url || museum.virtualUrl,
  id: museum.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, ""),
  type: inferType(museum.name),
}))

export const departments = [
  "Amazonas",
  "Áncash",
  "Apurímac",
  "Arequipa",
  "Ayacucho",
  "Cajamarca",
  "Callao",
  "Cusco",
  "Huancavelica",
  "Huánuco",
  "Ica",
  "Junín",
  "La Libertad",
  "Lambayeque",
  "Lima",
  "Loreto",
  "Madre de Dios",
  "Moquegua",
  "Pasco",
  "Piura",
  "Puno",
  "San Martín",
  "Tacna",
  "Tumbes",
  "Ucayali",
] as const
