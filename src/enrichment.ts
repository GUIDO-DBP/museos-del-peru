export const enrichment: Record<string, {
  address?: string
  addressSource?: string
  description: string
  descriptionSource: string
  officialUrl: string
  verifiedAt: string
  image: {
    src: string
    alt: string
    author: string
    license: string
    licenseUrl: string
    source: string
    changes: string
  }
}> = {
  "Museo Nacional Chavín": {
    description:
      "Conoce el legado de la cultura Chavín a través de esculturas de piedra, cerámicas y pututos. Su colección reúne piezas del monumento arqueológico, entre ellas las célebres cabezas clavas y el Obelisco Tello.",
    officialUrl:
      "https://museos.cultura.pe/index.php/museos/museo-nacional-chav%C3%ADn",
    descriptionSource:
      "https://museos.cultura.pe/index.php/museos/museo-nacional-chav%C3%ADn",
    image: {
      src: "/images/chavin.webp",
      alt: "Cabeza clava de felino en el Museo Nacional Chavín",
      author: "Cbrescia",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Redimensionada y convertida a WebP.",
      source:
        "https://commons.wikimedia.org/wiki/File:Cabeza_clava_de_felino_en_el_Museo_nacional_Chav%C3%ADn.jpg",
    },
    verifiedAt: "2026-10-23",
  },
  "Museo Lítico de Pukara": {
    address: "Jr. Lima s/n, Pucará, Lampa",
    addressSource:
      "https://museos.cultura.pe/index.php/museos/museo-l%C3%ADtico-de-pukara",
    description:
      "Descubre el arte en piedra de la cultura Pukara mediante estelas de granito y monolitos con formas humanas y animales. El museo conserva bienes recuperados durante las investigaciones realizadas en la zona arqueológica en la década de 1970.",
    officialUrl:
      "https://museos.cultura.pe/index.php/museos/museo-l%C3%ADtico-de-pukara",
    descriptionSource:
      "https://museos.cultura.pe/index.php/museos/museo-l%C3%ADtico-de-pukara",
    image: {
      src: "/images/pukara.webp",
      alt: "Esculturas de piedra de la cultura Pukara en el Museo Lítico",
      author: "Marie Thérèse Hébert y Jean Robert Thibault",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      changes: "Redimensionada y convertida a WebP.",
      source:
        "https://commons.wikimedia.org/wiki/File:P1040078_P%C3%A9rou,_Pukara,_Museo_L%C3%ADtico,_statues_de_la_civilisation_de_Pukara_(%C3%A9poque_pr%C3%A9inca)_(10384088126).jpg",
    },
    verifiedAt: "2026-10-23",
  },
  "Museo Pachacamac": {
    description:
      "Una introducción a la historia del santuario de Pachacamac y a los hallazgos de sus excavaciones. Entre sus piezas destacan el ídolo de Pachacamac, ofrendas de cerámica del periodo Wari y quipus de época inca.",
    officialUrl: "https://pachacamac.cultura.pe/museo-pachacamac",
    descriptionSource: "https://pachacamac.cultura.pe/museo-pachacamac",
    image: {
      src: "/images/pachacamac.webp",
      alt: "Panel con plano del santuario en el interior del Museo Pachacamac",
      author: "Shania Dayadi Solar Arotinco",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Redimensionada y convertida a WebP.",
      source: "https://commons.wikimedia.org/wiki/File:Museo_de_Pachacamac.jpg",
    },
    verifiedAt: "2026-10-23",
  },
  "Museo Tumbas Reales de Sipán": {
    description:
      "Acércate al mundo del Señor de Sipán a través de los hallazgos de su tumba en Huaca Rajada. El museo conserva ornamentos de oro, plata y turquesas, además de cerámicas y otros objetos de su ajuar funerario.",
    officialUrl:
      "https://museos.cultura.pe/museos/museo-tumbas-reales-de-sipan",
    descriptionSource:
      "https://www.peru.travel/es/atractivos/museos-tumbas-reales",
    image: {
      src: "/images/sipan.webp",
      alt: "Exterior del Museo Tumbas Reales de Sipán, en Lambayeque",
      author: "Velvet",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Redimensionada y convertida a WebP.",
      source:
        "https://commons.wikimedia.org/wiki/File:Lambayeque_museo_tumbas_reales_de_sipan.jpg",
    },
    verifiedAt: "2026-10-23",
  },
  "Museo Amazónico": {
    description:
      "En un edificio histórico de Iquitos, este museo reúne esculturas de Felipe Lettersten que representan a habitantes de comunidades amazónicas. Su recorrido también permite apreciar la decoración mural, los muebles antiguos y la madera tallada del inmueble.",
    officialUrl: "https://museos.cultura.pe/museos/museo-amaz%C3%B3nico",
    descriptionSource: "https://museos.cultura.pe/museos/museo-amaz%C3%B3nico",
    image: {
      src: "/images/amazonico.webp",
      alt: "Fachada del edificio que alberga el Museo Amazónico de Iquitos",
      author: "Estados Unidos de América del Sur",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Redimensionada y convertida a WebP.",
      source:
        "https://commons.wikimedia.org/wiki/File:Museo_Etnografico_Amazonico_de_Iquitos.jpg",
    },
    verifiedAt: "2026-10-23",
  },
  "Museo Municipal Carlos Dreyer": {
    description:
      "La antigua casa de Carlos Dreyer reúne colecciones que recorren la historia y el arte de Puno. Sus salas presentan piezas arqueológicas, esculturas líticas, pinturas y objetos de época, junto con el destacado conjunto del Tesoro de Sillustani.",
    officialUrl: "https://museodreyer.munipuno.gob.pe/",
    descriptionSource:
      "https://consultasenlinea.mincetur.gob.pe/fichaInventario/index.aspx?cod_Ficha=955",
    image: {
      src: "/images/dreyer.webp",
      alt: "Fachada del Museo Municipal Carlos Dreyer en Puno",
      author: "Omar Vega Ramos",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Redimensionada y convertida a WebP.",
      source:
        "https://commons.wikimedia.org/wiki/File:Museo_Carlos_Dreyer_en_Puno_01.jpg",
    },
    verifiedAt: "2026-10-23",
  },
}
