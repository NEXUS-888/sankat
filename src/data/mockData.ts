import { Crisis, Charity } from '@/types';

export const mockCrises: Crisis[] = [
  {
    id: 1,
    title: "Syria Civil War",
    category: "Conflict",
    country: "Syria",
    latitude: 34.8021,
    longitude: 38.9968,
    severity: "Critical",
    summary: "Ongoing civil war causing massive displacement and humanitarian crisis.",
    description: "The Syrian Civil War has resulted in over 500,000 deaths and displaced more than 13 million people. The conflict has created one of the worst humanitarian crises of our time, with millions in need of food, shelter, and medical care.",
    start_date: "2011-03-15",
    is_active: true
  },
  {
    id: 2,
    title: "Turkey-Syria Earthquake",
    category: "Disaster",
    country: "Turkey",
    latitude: 37.1833,
    longitude: 37.0667,
    severity: "Critical",
    summary: "Devastating 7.8 magnitude earthquake affecting millions.",
    description: "A catastrophic earthquake struck southeastern Turkey and northern Syria in February 2023, causing over 50,000 deaths and leaving millions homeless. Recovery efforts continue as communities rebuild.",
    start_date: "2023-02-06",
    is_active: true
  },
  {
    id: 3,
    title: "Yemen Humanitarian Crisis",
    category: "Humanitarian",
    country: "Yemen",
    latitude: 15.5527,
    longitude: 48.5164,
    severity: "Critical",
    summary: "Widespread famine and health emergency due to ongoing conflict.",
    description: "Yemen faces the world's worst humanitarian crisis with 21 million people in need of assistance. The conflict has led to widespread famine, disease outbreaks, and economic collapse.",
    start_date: "2014-09-21",
    is_active: true
  },
  {
    id: 4,
    title: "Amazon Deforestation",
    category: "Climate",
    country: "Brazil",
    latitude: -3.4653,
    longitude: -62.2159,
    severity: "High",
    summary: "Accelerating rainforest destruction threatening global climate.",
    description: "The Amazon rainforest continues to face unprecedented deforestation rates, threatening biodiversity, indigenous communities, and global climate stability. Urgent action is needed to protect this vital ecosystem.",
    start_date: "2019-01-01",
    is_active: true
  },
  {
    id: 5,
    title: "DRC Ebola Outbreak",
    category: "Health",
    country: "Democratic Republic of Congo",
    latitude: 0.5186,
    longitude: 25.0430,
    severity: "High",
    summary: "Recurring Ebola outbreaks requiring sustained medical response.",
    description: "The Democratic Republic of Congo continues to battle recurring Ebola outbreaks. Health workers are providing critical care and vaccination programs while addressing community trust challenges.",
    start_date: "2018-08-01",
    is_active: true
  },
  {
    id: 6,
    title: "Ukraine Conflict",
    category: "Conflict",
    country: "Ukraine",
    latitude: 48.3794,
    longitude: 31.1656,
    severity: "Critical",
    summary: "Major conflict causing widespread displacement and destruction.",
    description: "The ongoing conflict in Ukraine has displaced millions of people and caused significant infrastructure damage. Humanitarian organizations are working to provide aid to affected civilians.",
    start_date: "2022-02-24",
    is_active: true
  },
  {
    id: 7,
    title: "Pakistan Floods",
    category: "Disaster",
    country: "Pakistan",
    latitude: 30.3753,
    longitude: 69.3451,
    severity: "High",
    summary: "Catastrophic flooding affecting millions across the country.",
    description: "Historic monsoon floods in Pakistan affected over 33 million people, destroying homes, crops, and infrastructure. Recovery and rebuilding efforts continue as communities work to restore normalcy.",
    start_date: "2022-06-14",
    is_active: true
  },
  {
    id: 8,
    title: "Horn of Africa Drought",
    category: "Climate",
    country: "Ethiopia",
    latitude: 9.1450,
    longitude: 40.4897,
    severity: "Critical",
    summary: "Severe drought causing food insecurity across multiple countries.",
    description: "The Horn of Africa is experiencing its worst drought in 40 years, affecting over 20 million people across Ethiopia, Kenya, and Somalia. Food insecurity and water scarcity are reaching crisis levels.",
    start_date: "2020-10-01",
    is_active: true
  },
  {
    id: 9,
    title: "Rohingya Refugee Crisis",
    category: "Humanitarian",
    country: "Bangladesh",
    latitude: 21.4272,
    longitude: 92.0058,
    severity: "High",
    summary: "Over 1 million refugees in camps requiring long-term support.",
    description: "The Rohingya refugee crisis has resulted in over 1 million people living in camps in Bangladesh. Refugees face challenges including limited resources, education access, and uncertainty about their future.",
    start_date: "2017-08-25",
    is_active: true
  },
  {
    id: 10,
    title: "Madagascar Famine",
    category: "Climate",
    country: "Madagascar",
    latitude: -18.8792,
    longitude: 47.5079,
    severity: "High",
    summary: "Climate-driven famine affecting southern Madagascar.",
    description: "Southern Madagascar faces severe famine conditions driven by consecutive years of drought. Over 1 million people are experiencing acute food insecurity, with children particularly at risk of malnutrition.",
    start_date: "2021-01-01",
    is_active: true
  },
  {
    id: 11,
    title: "Haiti Political Crisis",
    category: "Humanitarian",
    country: "Haiti",
    latitude: 18.9712,
    longitude: -72.2852,
    severity: "High",
    summary: "Gang violence and political instability creating humanitarian emergency.",
    description: "Haiti is experiencing severe political instability and gang violence, leading to displacement, food insecurity, and limited access to basic services. The situation continues to deteriorate.",
    start_date: "2021-07-07",
    is_active: true
  },
  {
    id: 12,
    title: "India Heat Waves",
    category: "Climate",
    country: "India",
    latitude: 20.5937,
    longitude: 78.9629,
    severity: "Medium",
    summary: "Extreme heat events threatening vulnerable populations.",
    description: "India faces increasingly severe heat waves due to climate change, threatening agriculture, water resources, and public health. Vulnerable communities require support to adapt to these conditions.",
    start_date: "2022-03-01",
    is_active: true
  },
  {
    id: 13,
    title: "Afghanistan Humanitarian Crisis",
    category: "Humanitarian",
    country: "Afghanistan",
    latitude: 33.9391,
    longitude: 67.7100,
    severity: "Critical",
    summary: "Widespread poverty and food insecurity following political changes.",
    description: "Afghanistan faces a severe humanitarian crisis with over 28 million people requiring assistance. Economic collapse, food insecurity, and limited access to basic services continue to affect millions.",
    start_date: "2021-08-15",
    is_active: true
  },
  {
    id: 14,
    title: "Sudan Conflict",
    category: "Conflict",
    country: "Sudan",
    latitude: 12.8628,
    longitude: 30.2176,
    severity: "Critical",
    summary: "Armed conflict causing displacement and humanitarian emergency.",
    description: "Conflict in Sudan has displaced millions of people and created urgent humanitarian needs. Violence continues to affect civilian populations, with limited access to food, water, and medical care.",
    start_date: "2023-04-15",
    is_active: true
  },
  {
    id: 15,
    title: "Venezuela Economic Crisis",
    category: "Humanitarian",
    country: "Venezuela",
    latitude: 6.4238,
    longitude: -66.5897,
    severity: "Medium",
    summary: "Economic collapse driving migration and humanitarian needs.",
    description: "Venezuela's economic crisis has led to widespread shortages of food, medicine, and basic goods. Over 7 million people have fled the country, creating one of the largest displacement crises in the world.",
    start_date: "2014-01-01",
    is_active: true
  }
];

export const mockCharities: Charity[] = [
  // Syria
  { id: 1, name: "Syria Relief", description: "Providing humanitarian aid to Syrian civilians affected by conflict.", donation_url: "https://opencollective.com/syria-relief", crisis_id: 1 },
  { id: 2, name: "White Helmets", description: "Search and rescue volunteers saving lives in Syria.", donation_url: "https://opencollective.com/white-helmets", crisis_id: 1 },
  
  // Turkey-Syria Earthquake
  { id: 3, name: "AFAD Turkey", description: "Turkey's disaster relief agency coordinating earthquake response.", donation_url: "https://opencollective.com/afad", crisis_id: 2 },
  { id: 4, name: "GlobalGiving Earthquake Fund", description: "Supporting local organizations in earthquake recovery.", donation_url: "https://opencollective.com/globalgiving-earthquake", crisis_id: 2 },
  
  // Yemen
  { id: 5, name: "Yemen Aid", description: "Delivering food and medical supplies to Yemen.", donation_url: "https://opencollective.com/yemen-aid", crisis_id: 3 },
  { id: 6, name: "Doctors Without Borders Yemen", description: "Providing emergency medical care in Yemen.", donation_url: "https://opencollective.com/msf-yemen", crisis_id: 3 },
  
  // Amazon
  { id: 7, name: "Amazon Watch", description: "Protecting the rainforest and indigenous rights.", donation_url: "https://opencollective.com/amazon-watch", crisis_id: 4 },
  { id: 8, name: "Rainforest Alliance", description: "Working to conserve biodiversity and ensure sustainable livelihoods.", donation_url: "https://opencollective.com/rainforest-alliance", crisis_id: 4 },
  
  // DRC Ebola
  { id: 9, name: "MSF Ebola Response", description: "Medical teams fighting Ebola outbreaks.", donation_url: "https://opencollective.com/msf-ebola", crisis_id: 5 },
  { id: 10, name: "WHO Emergency Fund", description: "Supporting global health emergency response.", donation_url: "https://opencollective.com/who-emergency", crisis_id: 5 },
  
  // Ukraine
  { id: 11, name: "Ukraine Humanitarian Fund", description: "Supporting civilians affected by conflict in Ukraine.", donation_url: "https://opencollective.com/ukraine-fund", crisis_id: 6 },
  { id: 12, name: "UNHCR Ukraine", description: "Protecting and assisting refugees and displaced persons.", donation_url: "https://opencollective.com/unhcr-ukraine", crisis_id: 6 },
  
  // Pakistan Floods
  { id: 13, name: "Pakistan Flood Relief", description: "Emergency assistance for flood-affected communities.", donation_url: "https://opencollective.com/pakistan-flood", crisis_id: 7 },
  
  // Horn of Africa
  { id: 14, name: "Action Against Hunger", description: "Fighting hunger and malnutrition worldwide.", donation_url: "https://opencollective.com/action-hunger", crisis_id: 8 },
  { id: 15, name: "Oxfam East Africa", description: "Providing clean water and food security programs.", donation_url: "https://opencollective.com/oxfam-eastafrica", crisis_id: 8 },
  
  // Rohingya
  { id: 16, name: "Rohingya Relief Fund", description: "Supporting Rohingya refugees in Bangladesh.", donation_url: "https://opencollective.com/rohingya-relief", crisis_id: 9 },
  
  // Madagascar
  { id: 17, name: "WFP Madagascar", description: "World Food Programme operations in Madagascar.", donation_url: "https://opencollective.com/wfp-madagascar", crisis_id: 10 },
  
  // Haiti
  { id: 18, name: "Haiti Emergency Relief", description: "Providing immediate assistance in Haiti.", donation_url: "https://opencollective.com/haiti-relief", crisis_id: 11 },
  
  // India Heat Waves
  { id: 19, name: "Climate Action India", description: "Supporting climate adaptation and resilience.", donation_url: "https://opencollective.com/climate-india", crisis_id: 12 },
  
  // Afghanistan
  { id: 20, name: "Afghan Aid", description: "Humanitarian assistance for Afghan families.", donation_url: "https://opencollective.com/afghan-aid", crisis_id: 13 },
  
  // Sudan
  { id: 21, name: "Sudan Emergency Response", description: "Urgent aid for conflict-affected populations.", donation_url: "https://opencollective.com/sudan-emergency", crisis_id: 14 },
  
  // Venezuela
  { id: 22, name: "Venezuela Aid", description: "Supporting Venezuelans affected by economic crisis.", donation_url: "https://opencollective.com/venezuela-aid", crisis_id: 15 }
];
