#!/usr/bin/env python3
"""
Seed script for Global Problems Map database.
Populates the database with sample crisis and charity data.
"""

import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

# Sample crises data
CRISES = [
    {
        "title": "Syria Civil War",
        "category": "Conflict",
        "country": "Syria",
        "latitude": 34.8021,
        "longitude": 38.9968,
        "severity": "Critical",
        "summary": "Ongoing civil war causing massive displacement and humanitarian crisis.",
        "description": "The Syrian Civil War has resulted in over 500,000 deaths and displaced more than 13 million people. The conflict has created one of the worst humanitarian crises of our time, with millions in need of food, shelter, and medical care.",
        "start_date": "2011-03-15",
        "is_active": True
    },
    {
        "title": "Turkey-Syria Earthquake",
        "category": "Disaster",
        "country": "Turkey",
        "latitude": 37.1833,
        "longitude": 37.0667,
        "severity": "Critical",
        "summary": "Devastating 7.8 magnitude earthquake affecting millions.",
        "description": "A catastrophic earthquake struck southeastern Turkey and northern Syria in February 2023, causing over 50,000 deaths and leaving millions homeless. Recovery efforts continue as communities rebuild.",
        "start_date": "2023-02-06",
        "is_active": True
    },
    {
        "title": "Yemen Humanitarian Crisis",
        "category": "Humanitarian",
        "country": "Yemen",
        "latitude": 15.5527,
        "longitude": 48.5164,
        "severity": "Critical",
        "summary": "Widespread famine and health emergency due to ongoing conflict.",
        "description": "Yemen faces the world's worst humanitarian crisis with 21 million people in need of assistance. The conflict has led to widespread famine, disease outbreaks, and economic collapse.",
        "start_date": "2014-09-21",
        "is_active": True
    },
    {
        "title": "Amazon Deforestation",
        "category": "Climate",
        "country": "Brazil",
        "latitude": -3.4653,
        "longitude": -62.2159,
        "severity": "High",
        "summary": "Accelerating rainforest destruction threatening global climate.",
        "description": "The Amazon rainforest continues to face unprecedented deforestation rates, threatening biodiversity, indigenous communities, and global climate stability. Urgent action is needed to protect this vital ecosystem.",
        "start_date": "2019-01-01",
        "is_active": True
    },
    {
        "title": "DRC Ebola Outbreak",
        "category": "Health",
        "country": "Democratic Republic of Congo",
        "latitude": 0.5186,
        "longitude": 25.0430,
        "severity": "High",
        "summary": "Recurring Ebola outbreaks requiring sustained medical response.",
        "description": "The Democratic Republic of Congo continues to battle recurring Ebola outbreaks. Health workers are providing critical care and vaccination programs while addressing community trust challenges.",
        "start_date": "2018-08-01",
        "is_active": True
    },
    {
        "title": "Ukraine Conflict",
        "category": "Conflict",
        "country": "Ukraine",
        "latitude": 48.3794,
        "longitude": 31.1656,
        "severity": "Critical",
        "summary": "Major conflict causing widespread displacement and destruction.",
        "description": "The ongoing conflict in Ukraine has displaced millions of people and caused significant infrastructure damage. Humanitarian organizations are working to provide aid to affected civilians.",
        "start_date": "2022-02-24",
        "is_active": True
    },
    {
        "title": "Pakistan Floods",
        "category": "Disaster",
        "country": "Pakistan",
        "latitude": 30.3753,
        "longitude": 69.3451,
        "severity": "High",
        "summary": "Catastrophic flooding affecting millions across the country.",
        "description": "Historic monsoon floods in Pakistan affected over 33 million people, destroying homes, crops, and infrastructure. Recovery and rebuilding efforts continue as communities work to restore normalcy.",
        "start_date": "2022-06-14",
        "is_active": True
    },
    {
        "title": "Horn of Africa Drought",
        "category": "Climate",
        "country": "Ethiopia",
        "latitude": 9.1450,
        "longitude": 40.4897,
        "severity": "Critical",
        "summary": "Severe drought causing food insecurity across multiple countries.",
        "description": "The Horn of Africa is experiencing its worst drought in 40 years, affecting over 20 million people across Ethiopia, Kenya, and Somalia. Food insecurity and water scarcity are reaching crisis levels.",
        "start_date": "2020-10-01",
        "is_active": True
    },
    {
        "title": "Rohingya Refugee Crisis",
        "category": "Humanitarian",
        "country": "Bangladesh",
        "latitude": 21.4272,
        "longitude": 92.0058,
        "severity": "High",
        "summary": "Over 1 million refugees in camps requiring long-term support.",
        "description": "The Rohingya refugee crisis has resulted in over 1 million people living in camps in Bangladesh. Refugees face challenges including limited resources, education access, and uncertainty about their future.",
        "start_date": "2017-08-25",
        "is_active": True
    },
    {
        "title": "Madagascar Famine",
        "category": "Climate",
        "country": "Madagascar",
        "latitude": -18.8792,
        "longitude": 47.5079,
        "severity": "High",
        "summary": "Climate-driven famine affecting southern Madagascar.",
        "description": "Southern Madagascar faces severe famine conditions driven by consecutive years of drought. Over 1 million people are experiencing acute food insecurity, with children particularly at risk of malnutrition.",
        "start_date": "2021-01-01",
        "is_active": True
    },
    {
        "title": "Haiti Political Crisis",
        "category": "Humanitarian",
        "country": "Haiti",
        "latitude": 18.9712,
        "longitude": -72.2852,
        "severity": "High",
        "summary": "Gang violence and political instability creating humanitarian emergency.",
        "description": "Haiti is experiencing severe political instability and gang violence, leading to displacement, food insecurity, and limited access to basic services. The situation continues to deteriorate.",
        "start_date": "2021-07-07",
        "is_active": True
    },
    {
        "title": "India Heat Waves",
        "category": "Climate",
        "country": "India",
        "latitude": 20.5937,
        "longitude": 78.9629,
        "severity": "Medium",
        "summary": "Extreme heat events threatening vulnerable populations.",
        "description": "India faces increasingly severe heat waves due to climate change, threatening agriculture, water resources, and public health. Vulnerable communities require support to adapt to these conditions.",
        "start_date": "2022-03-01",
        "is_active": True
    },
    {
        "title": "Afghanistan Humanitarian Crisis",
        "category": "Humanitarian",
        "country": "Afghanistan",
        "latitude": 33.9391,
        "longitude": 67.7100,
        "severity": "Critical",
        "summary": "Widespread poverty and food insecurity following political changes.",
        "description": "Afghanistan faces a severe humanitarian crisis with over 28 million people requiring assistance. Economic collapse, food insecurity, and limited access to basic services continue to affect millions.",
        "start_date": "2021-08-15",
        "is_active": True
    },
    {
        "title": "Sudan Conflict",
        "category": "Conflict",
        "country": "Sudan",
        "latitude": 12.8628,
        "longitude": 30.2176,
        "severity": "Critical",
        "summary": "Armed conflict causing displacement and humanitarian emergency.",
        "description": "Conflict in Sudan has displaced millions of people and created urgent humanitarian needs. Violence continues to affect civilian populations, with limited access to food, water, and medical care.",
        "start_date": "2023-04-15",
        "is_active": True
    },
    {
        "title": "Venezuela Economic Crisis",
        "category": "Humanitarian",
        "country": "Venezuela",
        "latitude": 6.4238,
        "longitude": -66.5897,
        "severity": "Medium",
        "summary": "Economic collapse driving migration and humanitarian needs.",
        "description": "Venezuela's economic crisis has led to widespread shortages of food, medicine, and basic goods. Over 7 million people have fled the country, creating one of the largest displacement crises in the world.",
        "start_date": "2014-01-01",
        "is_active": True
    },
    {
        "title": "Gaza Humanitarian Crisis",
        "category": "Conflict",
        "country": "Palestine",
        "latitude": 31.3547,
        "longitude": 34.3088,
        "severity": "Critical",
        "summary": "Ongoing conflict causing severe humanitarian emergency in Gaza.",
        "description": "The Gaza Strip faces a critical humanitarian crisis with widespread destruction of infrastructure, limited access to clean water, electricity, and medical supplies. Millions of civilians are trapped in an active conflict zone.",
        "start_date": "2023-10-07",
        "is_active": True
    },
    {
        "title": "Myanmar Civil Conflict",
        "category": "Conflict",
        "country": "Myanmar",
        "latitude": 21.9162,
        "longitude": 95.9560,
        "severity": "High",
        "summary": "Military coup aftermath leading to civil unrest and displacement.",
        "description": "Following the 2021 military coup, Myanmar has experienced widespread civil conflict, human rights violations, and displacement. Over 1 million people have been displaced internally, with humanitarian access severely restricted.",
        "start_date": "2021-02-01",
        "is_active": True
    },
    {
        "title": "Morocco Earthquake",
        "category": "Disaster",
        "country": "Morocco",
        "latitude": 31.1728,
        "longitude": -7.3362,
        "severity": "High",
        "summary": "Devastating earthquake in Atlas Mountains region.",
        "description": "A powerful 6.8 magnitude earthquake struck Morocco's Atlas Mountains in September 2023, killing thousands and destroying entire villages. Remote communities continue to struggle with access to shelter and basic services.",
        "start_date": "2023-09-08",
        "is_active": True
    },
    {
        "title": "Libya Floods",
        "category": "Disaster",
        "country": "Libya",
        "latitude": 32.7500,
        "longitude": 22.0000,
        "severity": "High",
        "summary": "Catastrophic flooding from Storm Daniel.",
        "description": "Storm Daniel caused devastating floods in eastern Libya, with dam collapses leading to over 10,000 deaths in Derna. Entire neighborhoods were washed away, and thousands remain missing.",
        "start_date": "2023-09-10",
        "is_active": True
    },
    {
        "title": "Tigray Humanitarian Crisis",
        "category": "Humanitarian",
        "country": "Ethiopia",
        "latitude": 14.0000,
        "longitude": 38.0000,
        "severity": "Critical",
        "summary": "Ongoing humanitarian emergency in Tigray region.",
        "description": "The Tigray region faces severe food insecurity, lack of medical supplies, and restricted humanitarian access. Millions are in urgent need of assistance following years of conflict.",
        "start_date": "2020-11-04",
        "is_active": True
    },
    {
        "title": "Central African Republic Conflict",
        "category": "Conflict",
        "country": "Central African Republic",
        "latitude": 6.6111,
        "longitude": 20.9394,
        "severity": "High",
        "summary": "Prolonged civil conflict affecting civilian populations.",
        "description": "The Central African Republic continues to experience armed conflict between various factions, resulting in widespread displacement, food insecurity, and limited access to basic services for millions.",
        "start_date": "2012-12-10",
        "is_active": True
    },
    {
        "title": "Somalia Famine",
        "category": "Humanitarian",
        "country": "Somalia",
        "latitude": 5.1521,
        "longitude": 46.1996,
        "severity": "Critical",
        "summary": "Severe drought and conflict-driven famine.",
        "description": "Somalia faces catastrophic famine conditions with over 8 million people requiring humanitarian assistance. Consecutive failed rainy seasons, combined with ongoing conflict, have created a dire humanitarian emergency.",
        "start_date": "2021-10-01",
        "is_active": True
    },
    {
        "title": "Nepal Earthquake Recovery",
        "category": "Disaster",
        "country": "Nepal",
        "latitude": 28.2380,
        "longitude": 83.9956,
        "severity": "Medium",
        "summary": "Continued recovery from devastating earthquake.",
        "description": "Nepal continues recovery efforts from the 2023 earthquake that struck western regions, affecting thousands of families and damaging critical infrastructure in remote mountainous areas.",
        "start_date": "2023-11-03",
        "is_active": True
    },
    {
        "title": "Arctic Ice Melt",
        "category": "Climate",
        "country": "Arctic Region",
        "latitude": 66.5039,
        "longitude": -58.0000,
        "severity": "High",
        "summary": "Accelerating ice loss threatening global climate systems.",
        "description": "The Arctic is warming at twice the global average rate, with sea ice reaching record lows. This threatens indigenous communities, wildlife, and has far-reaching implications for global climate patterns.",
        "start_date": "2020-01-01",
        "is_active": True
    },
    {
        "title": "Sahel Food Crisis",
        "category": "Humanitarian",
        "country": "Niger",
        "latitude": 17.6078,
        "longitude": 8.0817,
        "severity": "High",
        "summary": "Food insecurity across the Sahel region.",
        "description": "The Sahel region faces severe food insecurity affecting millions across Niger, Mali, Burkina Faso, and Chad. Climate change, conflict, and economic instability compound the crisis.",
        "start_date": "2022-06-01",
        "is_active": True
    },
    {
        "title": "Philippine Typhoons",
        "category": "Disaster",
        "country": "Philippines",
        "latitude": 12.8797,
        "longitude": 121.7740,
        "severity": "Medium",
        "summary": "Recurring typhoon damage and displacement.",
        "description": "The Philippines faces increasingly intense typhoons affecting millions annually. Recent storms have destroyed homes, agriculture, and infrastructure, particularly in vulnerable coastal communities.",
        "start_date": "2023-07-01",
        "is_active": True
    },
    {
        "title": "Colombia Displacement Crisis",
        "category": "Humanitarian",
        "country": "Colombia",
        "latitude": 4.5709,
        "longitude": -74.2973,
        "severity": "Medium",
        "summary": "Ongoing internal displacement from violence.",
        "description": "Colombia continues to face internal displacement due to armed group violence, particularly affecting rural and indigenous communities. Over 8 million people have been displaced historically.",
        "start_date": "2021-01-01",
        "is_active": True
    },
    {
        "title": "Congo River Basin Deforestation",
        "category": "Climate",
        "country": "Democratic Republic of Congo",
        "latitude": -4.0383,
        "longitude": 21.7587,
        "severity": "High",
        "summary": "Rapid deforestation threatening biodiversity and climate.",
        "description": "The Congo Basin, Earth's second-largest rainforest, faces accelerating deforestation from logging, mining, and agricultural expansion. This threatens countless species and global carbon storage.",
        "start_date": "2019-01-01",
        "is_active": True
    },
    {
        "title": "Iranian Water Crisis",
        "category": "Climate",
        "country": "Iran",
        "latitude": 32.4279,
        "longitude": 53.6880,
        "severity": "Medium",
        "summary": "Severe water scarcity affecting millions.",
        "description": "Iran faces a critical water crisis with major rivers and lakes drying up, aquifers depleting, and widespread water rationing. Climate change and mismanagement have created tensions and displacement.",
        "start_date": "2021-01-01",
        "is_active": True
    },
    {
        "title": "Australian Bushfire Recovery",
        "category": "Climate",
        "country": "Australia",
        "latitude": -25.2744,
        "longitude": 133.7751,
        "severity": "Medium",
        "summary": "Climate-driven wildfire risks and recovery efforts.",
        "description": "Australia faces increasing bushfire risks due to climate change, with devastating fires destroying homes, wildlife habitats, and causing air quality crises in major cities.",
        "start_date": "2023-01-01",
        "is_active": True
    },
    {
        "title": "South Sudan Humanitarian Crisis",
        "category": "Humanitarian",
        "country": "South Sudan",
        "latitude": 6.8770,
        "longitude": 31.3070,
        "severity": "Critical",
        "summary": "Conflict and flooding creating severe humanitarian needs.",
        "description": "South Sudan faces compounding crises of conflict, flooding, and food insecurity. Over 9 million people require humanitarian assistance, with widespread displacement and limited access to services.",
        "start_date": "2013-12-15",
        "is_active": True
    },
    {
        "title": "Malawi Cholera Outbreak",
        "category": "Health",
        "country": "Malawi",
        "latitude": -13.2543,
        "longitude": 34.3015,
        "severity": "Medium",
        "summary": "Deadly cholera epidemic affecting thousands.",
        "description": "Malawi is battling one of its worst cholera outbreaks, with thousands of cases and hundreds of deaths. Limited access to clean water and sanitation infrastructure compounds the crisis.",
        "start_date": "2022-11-01",
        "is_active": True
    },
    {
        "title": "Nigerian Insurgency",
        "category": "Conflict",
        "country": "Nigeria",
        "latitude": 11.8333,
        "longitude": 13.1500,
        "severity": "High",
        "summary": "Ongoing insurgency in northeast Nigeria.",
        "description": "Northeast Nigeria faces continued violence from armed groups, causing displacement, food insecurity, and limited access to education and healthcare for millions of civilians.",
        "start_date": "2009-01-01",
        "is_active": True
    },
    {
        "title": "Greece Wildfire Crisis",
        "category": "Disaster",
        "country": "Greece",
        "latitude": 39.0742,
        "longitude": 21.8243,
        "severity": "Medium",
        "summary": "Recurring wildfires threatening communities and ecosystems.",
        "description": "Greece faces increasingly severe wildfire seasons, with fires destroying homes, forests, and causing evacuations. Climate change intensifies the risk to Mediterranean ecosystems.",
        "start_date": "2023-07-15",
        "is_active": True
    },
    # Additional crises for more global coverage
    {
        "title": "Bangladesh Flooding",
        "category": "Disaster",
        "country": "Bangladesh",
        "latitude": 23.6850,
        "longitude": 90.3563,
        "severity": "High",
        "summary": "Annual monsoon flooding affecting millions.",
        "description": "Bangladesh experiences severe annual flooding affecting millions of people, destroying crops, homes, and infrastructure. Climate change is intensifying these events.",
        "start_date": "2024-06-01",
        "is_active": True
    },
    {
        "title": "Mozambique Cyclone Recovery",
        "category": "Disaster",
        "country": "Mozambique",
        "latitude": -18.6657,
        "longitude": 35.5296,
        "severity": "High",
        "summary": "Recovery from devastating cyclones.",
        "description": "Mozambique continues recovery from multiple devastating cyclones that have caused widespread destruction, displacement, and food insecurity in coastal regions.",
        "start_date": "2024-02-15",
        "is_active": True
    },
    {
        "title": "Chile Wildfires",
        "category": "Disaster",
        "country": "Chile",
        "latitude": -33.4489,
        "longitude": -70.6693,
        "severity": "High",
        "summary": "Devastating wildfires in central Chile.",
        "description": "Chile faces increasingly severe wildfires driven by drought and extreme heat, destroying thousands of homes and causing significant loss of life.",
        "start_date": "2024-02-01",
        "is_active": True
    },
    {
        "title": "Japan Earthquake",
        "category": "Disaster",
        "country": "Japan",
        "latitude": 37.4900,
        "longitude": 137.0000,
        "severity": "High",
        "summary": "Major earthquake affecting Noto Peninsula.",
        "description": "A powerful earthquake struck Japan's Noto Peninsula causing significant damage, casualties, and displacement in coastal communities.",
        "start_date": "2024-01-01",
        "is_active": True
    },
    {
        "title": "Taiwan Earthquake",
        "category": "Disaster",
        "country": "Taiwan",
        "latitude": 23.8100,
        "longitude": 121.5654,
        "severity": "High",
        "summary": "Major earthquake in eastern Taiwan.",
        "description": "A significant earthquake struck eastern Taiwan causing building collapses, landslides, and infrastructure damage.",
        "start_date": "2024-04-03",
        "is_active": True
    },
    {
        "title": "Indonesia Volcanic Activity",
        "category": "Disaster",
        "country": "Indonesia",
        "latitude": -7.5407,
        "longitude": 110.4460,
        "severity": "Medium",
        "summary": "Multiple active volcanoes threatening communities.",
        "description": "Indonesia's ring of fire volcanoes pose ongoing threats to nearby communities, with regular evacuations and disruptions to daily life.",
        "start_date": "2024-01-01",
        "is_active": True
    },
    {
        "title": "Kenya Flooding",
        "category": "Disaster",
        "country": "Kenya",
        "latitude": -1.2864,
        "longitude": 36.8172,
        "severity": "High",
        "summary": "Severe flooding across multiple regions.",
        "description": "Heavy rains have caused severe flooding in Kenya, displacing hundreds of thousands and destroying homes, roads, and farmland.",
        "start_date": "2024-04-15",
        "is_active": True
    },
    {
        "title": "Brazil Floods",
        "category": "Disaster",
        "country": "Brazil",
        "latitude": -30.0346,
        "longitude": -51.2177,
        "severity": "Critical",
        "summary": "Historic flooding in Rio Grande do Sul.",
        "description": "Historic flooding in southern Brazil has caused widespread devastation, displacing over 500,000 people and causing significant loss of life and infrastructure damage.",
        "start_date": "2024-05-01",
        "is_active": True
    },
    {
        "title": "Cameroon Anglophone Crisis",
        "category": "Conflict",
        "country": "Cameroon",
        "latitude": 5.9631,
        "longitude": 10.1591,
        "severity": "High",
        "summary": "Ongoing conflict in English-speaking regions.",
        "description": "The Anglophone crisis in Cameroon has displaced hundreds of thousands, with ongoing violence affecting education, healthcare, and economic activity.",
        "start_date": "2017-10-01",
        "is_active": True
    },
    {
        "title": "Burkina Faso Insurgency",
        "category": "Conflict",
        "country": "Burkina Faso",
        "latitude": 12.2383,
        "longitude": -1.5616,
        "severity": "Critical",
        "summary": "Armed groups causing mass displacement.",
        "description": "Burkina Faso faces escalating violence from armed groups, causing massive displacement and humanitarian needs across the country.",
        "start_date": "2019-01-01",
        "is_active": True
    },
    {
        "title": "Mali Conflict",
        "category": "Conflict",
        "country": "Mali",
        "latitude": 17.5707,
        "longitude": -3.9962,
        "severity": "High",
        "summary": "Ongoing instability and armed conflict.",
        "description": "Mali continues to experience armed conflict and political instability, with humanitarian consequences for millions of civilians.",
        "start_date": "2012-01-01",
        "is_active": True
    },
    {
        "title": "Mexico Drug Violence",
        "category": "Conflict",
        "country": "Mexico",
        "latitude": 23.6345,
        "longitude": -102.5528,
        "severity": "High",
        "summary": "Cartel violence affecting communities.",
        "description": "Drug cartel violence continues to affect communities across Mexico, causing displacement, human rights violations, and humanitarian needs.",
        "start_date": "2020-01-01",
        "is_active": True
    },
    {
        "title": "El Salvador Gang Violence",
        "category": "Conflict",
        "country": "El Salvador",
        "latitude": 13.7942,
        "longitude": -88.8965,
        "severity": "Medium",
        "summary": "Gang violence and state of emergency measures.",
        "description": "El Salvador has implemented emergency measures to combat gang violence, with significant human rights implications and displacement.",
        "start_date": "2022-03-27",
        "is_active": True
    },
    {
        "title": "Ecuador Drug Trafficking Crisis",
        "category": "Conflict",
        "country": "Ecuador",
        "latitude": -1.8312,
        "longitude": -78.1834,
        "severity": "High",
        "summary": "Escalating drug-related violence.",
        "description": "Ecuador faces escalating violence from drug trafficking organizations, with prison riots, assassinations, and growing insecurity.",
        "start_date": "2024-01-08",
        "is_active": True
    },
    {
        "title": "Mpox Outbreak Africa",
        "category": "Health",
        "country": "Democratic Republic of Congo",
        "latitude": -4.4419,
        "longitude": 15.2663,
        "severity": "High",
        "summary": "Mpox outbreak declared public health emergency.",
        "description": "A new strain of mpox is spreading rapidly in Central Africa, with the WHO declaring it a public health emergency of international concern.",
        "start_date": "2024-07-01",
        "is_active": True
    },
    {
        "title": "Dengue Epidemic Americas",
        "category": "Health",
        "country": "Brazil",
        "latitude": -15.8267,
        "longitude": -47.9218,
        "severity": "High",
        "summary": "Record dengue cases across the Americas.",
        "description": "The Americas are experiencing record dengue fever cases, with Brazil, Argentina, and other countries declaring health emergencies.",
        "start_date": "2024-01-01",
        "is_active": True
    },
    {
        "title": "Polio Resurgence Gaza",
        "category": "Health",
        "country": "Palestine",
        "latitude": 31.5000,
        "longitude": 34.4667,
        "severity": "High",
        "summary": "Polio detected after 25 years.",
        "description": "Polio has been detected in Gaza for the first time in 25 years, threatening a wider outbreak amid ongoing conflict and humanitarian crisis.",
        "start_date": "2024-08-01",
        "is_active": True
    },
    {
        "title": "Measles Outbreak Europe",
        "category": "Health",
        "country": "United Kingdom",
        "latitude": 52.3555,
        "longitude": -1.1743,
        "severity": "Medium",
        "summary": "Rising measles cases in European countries.",
        "description": "Multiple European countries are experiencing measles outbreaks due to declining vaccination rates, with health authorities urging increased immunization.",
        "start_date": "2024-01-15",
        "is_active": True
    },
    {
        "title": "H5N1 Bird Flu Spread",
        "category": "Health",
        "country": "United States",
        "latitude": 39.8283,
        "longitude": -98.5795,
        "severity": "Medium",
        "summary": "Bird flu spreading to mammals and dairy cattle.",
        "description": "H5N1 avian influenza is spreading to dairy cattle and other mammals, raising concerns about potential human pandemic risk.",
        "start_date": "2024-03-01",
        "is_active": True
    },
    {
        "title": "Great Barrier Reef Bleaching",
        "category": "Climate",
        "country": "Australia",
        "latitude": -18.2871,
        "longitude": 147.6992,
        "severity": "Critical",
        "summary": "Mass coral bleaching event.",
        "description": "The Great Barrier Reef is experiencing its worst mass bleaching event on record, with coral death threatening the world's largest reef ecosystem.",
        "start_date": "2024-02-01",
        "is_active": True
    },
    {
        "title": "Antarctic Ice Sheet Collapse",
        "category": "Climate",
        "country": "Antarctica",
        "latitude": -75.2509,
        "longitude": -0.0713,
        "severity": "Critical",
        "summary": "Accelerating ice loss threatening sea level rise.",
        "description": "Antarctic ice sheets are losing mass at accelerating rates, with major glaciers showing signs of instability that could lead to significant sea level rise.",
        "start_date": "2024-01-01",
        "is_active": True
    },
    {
        "title": "California Drought",
        "category": "Climate",
        "country": "United States",
        "latitude": 36.7783,
        "longitude": -119.4179,
        "severity": "High",
        "summary": "Persistent drought affecting water supplies.",
        "description": "California continues to face long-term drought conditions affecting agriculture, water supplies, and increasing wildfire risk.",
        "start_date": "2020-01-01",
        "is_active": True
    },
    {
        "title": "European Heat Waves",
        "category": "Climate",
        "country": "Spain",
        "latitude": 40.4168,
        "longitude": -3.7038,
        "severity": "High",
        "summary": "Record-breaking heat waves across Europe.",
        "description": "Southern Europe is experiencing increasingly severe heat waves, causing deaths, wildfires, and strain on infrastructure and agriculture.",
        "start_date": "2024-07-01",
        "is_active": True
    },
    {
        "title": "Ganges River Pollution",
        "category": "Climate",
        "country": "India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "severity": "High",
        "summary": "Severe pollution affecting sacred river.",
        "description": "The Ganges River faces severe pollution from industrial waste, sewage, and agricultural runoff, affecting millions who depend on it for water and livelihood.",
        "start_date": "2020-01-01",
        "is_active": True
    },
    {
        "title": "Aral Sea Disappearance",
        "category": "Climate",
        "country": "Kazakhstan",
        "latitude": 45.0000,
        "longitude": 60.0000,
        "severity": "High",
        "summary": "Ecological catastrophe from water diversion.",
        "description": "The Aral Sea has shrunk to a fraction of its original size due to Soviet-era irrigation projects, causing ecological devastation and health crises.",
        "start_date": "2000-01-01",
        "is_active": True
    },
    {
        "title": "Tuvalu Sinking Islands",
        "category": "Climate",
        "country": "Tuvalu",
        "latitude": -7.1095,
        "longitude": 177.6493,
        "severity": "Critical",
        "summary": "Nation threatened by rising sea levels.",
        "description": "Tuvalu faces existential threat from rising sea levels, with the nation potentially becoming uninhabitable within decades due to climate change.",
        "start_date": "2020-01-01",
        "is_active": True
    },
    {
        "title": "North Korea Food Crisis",
        "category": "Humanitarian",
        "country": "North Korea",
        "latitude": 40.3399,
        "longitude": 127.5101,
        "severity": "High",
        "summary": "Chronic food insecurity and malnutrition.",
        "description": "North Korea faces chronic food insecurity affecting millions, with limited international access making humanitarian response challenging.",
        "start_date": "2021-01-01",
        "is_active": True
    },
    {
        "title": "Eritrea Human Rights Crisis",
        "category": "Humanitarian",
        "country": "Eritrea",
        "latitude": 15.1794,
        "longitude": 39.7823,
        "severity": "High",
        "summary": "Forced conscription and human rights abuses.",
        "description": "Eritrea faces a humanitarian crisis driven by indefinite military conscription, political repression, and lack of basic freedoms, driving mass migration.",
        "start_date": "2010-01-01",
        "is_active": True
    },
    {
        "title": "Uyghur Persecution China",
        "category": "Humanitarian",
        "country": "China",
        "latitude": 41.7509,
        "longitude": 87.6177,
        "severity": "Critical",
        "summary": "Mass detention and cultural persecution.",
        "description": "The Uyghur population in Xinjiang faces mass detention, forced labor, and cultural persecution in what many describe as crimes against humanity.",
        "start_date": "2017-01-01",
        "is_active": True
    },
    {
        "title": "Cuban Economic Crisis",
        "category": "Humanitarian",
        "country": "Cuba",
        "latitude": 21.5218,
        "longitude": -77.7812,
        "severity": "High",
        "summary": "Severe shortages of food and medicine.",
        "description": "Cuba faces its worst economic crisis in decades, with severe shortages of food, medicine, and fuel driving emigration and civil unrest.",
        "start_date": "2021-07-01",
        "is_active": True
    },
    {
        "title": "Lebanon Economic Collapse",
        "category": "Humanitarian",
        "country": "Lebanon",
        "latitude": 33.8547,
        "longitude": 35.8623,
        "severity": "Critical",
        "summary": "Economic collapse affecting basic services.",
        "description": "Lebanon's economic collapse has led to currency devaluation, banking crisis, and severe shortages of fuel, electricity, and medicine.",
        "start_date": "2019-10-01",
        "is_active": True
    },
    {
        "title": "Sri Lanka Economic Crisis",
        "category": "Humanitarian",
        "country": "Sri Lanka",
        "latitude": 7.8731,
        "longitude": 80.7718,
        "severity": "High",
        "summary": "Economic default and humanitarian impact.",
        "description": "Sri Lanka's debt default has led to severe shortages of essential goods, fuel, and medicine, with millions facing food insecurity.",
        "start_date": "2022-04-01",
        "is_active": True
    },
    {
        "title": "Russian Invasion Ukraine - Eastern Front",
        "category": "Conflict",
        "country": "Ukraine",
        "latitude": 48.0000,
        "longitude": 37.8000,
        "severity": "Critical",
        "summary": "Intense fighting in eastern regions.",
        "description": "Eastern Ukraine sees continued intense combat with significant civilian casualties and infrastructure destruction in cities like Bakhmut and Avdiivka.",
        "start_date": "2022-02-24",
        "is_active": True
    },
    {
        "title": "Nagorno-Karabakh Displacement",
        "category": "Humanitarian",
        "country": "Armenia",
        "latitude": 39.8153,
        "longitude": 46.7519,
        "severity": "High",
        "summary": "Mass displacement from Nagorno-Karabakh.",
        "description": "Over 100,000 ethnic Armenians were displaced from Nagorno-Karabakh following Azerbaijan's military operation, creating urgent humanitarian needs.",
        "start_date": "2023-09-19",
        "is_active": True
    },
    {
        "title": "Chad Refugee Crisis",
        "category": "Humanitarian",
        "country": "Chad",
        "latitude": 15.4542,
        "longitude": 18.7322,
        "severity": "High",
        "summary": "Hosting hundreds of thousands of refugees.",
        "description": "Chad hosts hundreds of thousands of refugees from Sudan, Central African Republic, and Nigeria, straining resources in one of the world's poorest countries.",
        "start_date": "2023-04-20",
        "is_active": True
    },
    {
        "title": "Ethiopia Oromia Conflict",
        "category": "Conflict",
        "country": "Ethiopia",
        "latitude": 7.5460,
        "longitude": 39.1728,
        "severity": "High",
        "summary": "Armed conflict in Oromia region.",
        "description": "Armed conflict between government forces and the Oromo Liberation Army has caused displacement, human rights abuses, and humanitarian needs.",
        "start_date": "2022-01-01",
        "is_active": True
    },
    {
        "title": "Israel-Lebanon Border Conflict",
        "category": "Conflict",
        "country": "Lebanon",
        "latitude": 33.2721,
        "longitude": 35.2033,
        "severity": "Critical",
        "summary": "Cross-border hostilities and displacement.",
        "description": "Escalating cross-border attacks between Israel and Hezbollah have displaced tens of thousands on both sides of the border.",
        "start_date": "2023-10-08",
        "is_active": True
    },
    {
        "title": "Papua New Guinea Landslide",
        "category": "Disaster",
        "country": "Papua New Guinea",
        "latitude": -5.5311,
        "longitude": 143.5575,
        "severity": "Critical",
        "summary": "Massive landslide burying villages.",
        "description": "A massive landslide in Papua New Guinea buried entire villages, with hundreds feared dead and thousands displaced in remote highland areas.",
        "start_date": "2024-05-24",
        "is_active": True
    },
    {
        "title": "Iceland Volcanic Eruption",
        "category": "Disaster",
        "country": "Iceland",
        "latitude": 63.8791,
        "longitude": -22.4390,
        "severity": "Medium",
        "summary": "Ongoing volcanic eruptions near Grindavík.",
        "description": "Repeated volcanic eruptions on the Reykjanes Peninsula have forced evacuations of the town of Grindavík and threaten critical infrastructure.",
        "start_date": "2023-11-10",
        "is_active": True
    },
    {
        "title": "Dubai Flooding",
        "category": "Disaster",
        "country": "United Arab Emirates",
        "latitude": 25.2048,
        "longitude": 55.2708,
        "severity": "Medium",
        "summary": "Unprecedented flooding in desert nation.",
        "description": "The UAE experienced its heaviest rainfall in 75 years, causing unprecedented flooding in Dubai and other cities, disrupting infrastructure and travel.",
        "start_date": "2024-04-16",
        "is_active": True
    },
    {
        "title": "Sahara Desert Expansion",
        "category": "Climate",
        "country": "Algeria",
        "latitude": 27.0000,
        "longitude": 1.0000,
        "severity": "High",
        "summary": "Desertification threatening livelihoods.",
        "description": "The Sahara Desert continues to expand southward, threatening agricultural land and livelihoods across North and West Africa.",
        "start_date": "2020-01-01",
        "is_active": True
    },
    {
        "title": "Mekong River Crisis",
        "category": "Climate",
        "country": "Vietnam",
        "latitude": 10.0341,
        "longitude": 105.7839,
        "severity": "High",
        "summary": "Dam construction affecting downstream communities.",
        "description": "Dam construction on the Mekong River has disrupted water flows, sediment, and fish migration, threatening food security for millions.",
        "start_date": "2019-01-01",
        "is_active": True
    },
    {
        "title": "Jakarta Sinking",
        "category": "Climate",
        "country": "Indonesia",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "severity": "Critical",
        "summary": "Capital city sinking due to groundwater extraction.",
        "description": "Jakarta is sinking at one of the fastest rates in the world due to groundwater extraction, prompting plans to relocate the capital.",
        "start_date": "2020-01-01",
        "is_active": True
    }
]

# Sample charities data (crisis_id will be set based on inserted crises)
CHARITIES = [
    {"name": "Syria Relief", "description": "Providing humanitarian aid to Syrian civilians affected by conflict.", "donation_url": "https://opencollective.com/syria-relief", "crisis_title": "Syria Civil War"},
    {"name": "White Helmets", "description": "Search and rescue volunteers saving lives in Syria.", "donation_url": "https://opencollective.com/white-helmets", "crisis_title": "Syria Civil War"},
    {"name": "AFAD Turkey", "description": "Turkey's disaster relief agency coordinating earthquake response.", "donation_url": "https://opencollective.com/afad", "crisis_title": "Turkey-Syria Earthquake"},
    {"name": "GlobalGiving Earthquake Fund", "description": "Supporting local organizations in earthquake recovery.", "donation_url": "https://opencollective.com/globalgiving-earthquake", "crisis_title": "Turkey-Syria Earthquake"},
    {"name": "Yemen Aid", "description": "Delivering food and medical supplies to Yemen.", "donation_url": "https://opencollective.com/yemen-aid", "crisis_title": "Yemen Humanitarian Crisis"},
    {"name": "Doctors Without Borders Yemen", "description": "Providing emergency medical care in Yemen.", "donation_url": "https://opencollective.com/msf-yemen", "crisis_title": "Yemen Humanitarian Crisis"},
    {"name": "Amazon Watch", "description": "Protecting the rainforest and indigenous rights.", "donation_url": "https://opencollective.com/amazon-watch", "crisis_title": "Amazon Deforestation"},
    {"name": "Rainforest Alliance", "description": "Working to conserve biodiversity and ensure sustainable livelihoods.", "donation_url": "https://opencollective.com/rainforest-alliance", "crisis_title": "Amazon Deforestation"},
    {"name": "MSF Ebola Response", "description": "Medical teams fighting Ebola outbreaks.", "donation_url": "https://opencollective.com/msf-ebola", "crisis_title": "DRC Ebola Outbreak"},
    {"name": "WHO Emergency Fund", "description": "Supporting global health emergency response.", "donation_url": "https://opencollective.com/who-emergency", "crisis_title": "DRC Ebola Outbreak"},
    {"name": "Ukraine Humanitarian Fund", "description": "Supporting civilians affected by conflict in Ukraine.", "donation_url": "https://opencollective.com/ukraine-fund", "crisis_title": "Ukraine Conflict"},
    {"name": "UNHCR Ukraine", "description": "Protecting and assisting refugees and displaced persons.", "donation_url": "https://opencollective.com/unhcr-ukraine", "crisis_title": "Ukraine Conflict"},
    {"name": "Pakistan Flood Relief", "description": "Emergency assistance for flood-affected communities.", "donation_url": "https://opencollective.com/pakistan-flood", "crisis_title": "Pakistan Floods"},
    {"name": "Action Against Hunger", "description": "Fighting hunger and malnutrition worldwide.", "donation_url": "https://opencollective.com/action-hunger", "crisis_title": "Horn of Africa Drought"},
    {"name": "Oxfam East Africa", "description": "Providing clean water and food security programs.", "donation_url": "https://opencollective.com/oxfam-eastafrica", "crisis_title": "Horn of Africa Drought"},
    {"name": "Rohingya Relief Fund", "description": "Supporting Rohingya refugees in Bangladesh.", "donation_url": "https://opencollective.com/rohingya-relief", "crisis_title": "Rohingya Refugee Crisis"},
    {"name": "WFP Madagascar", "description": "World Food Programme operations in Madagascar.", "donation_url": "https://opencollective.com/wfp-madagascar", "crisis_title": "Madagascar Famine"},
    {"name": "Haiti Emergency Relief", "description": "Providing immediate assistance in Haiti.", "donation_url": "https://opencollective.com/haiti-relief", "crisis_title": "Haiti Political Crisis"},
    {"name": "Climate Action India", "description": "Supporting climate adaptation and resilience.", "donation_url": "https://opencollective.com/climate-india", "crisis_title": "India Heat Waves"},
    {"name": "Afghan Aid", "description": "Humanitarian assistance for Afghan families.", "donation_url": "https://opencollective.com/afghan-aid", "crisis_title": "Afghanistan Humanitarian Crisis"},
    {"name": "Sudan Emergency Response", "description": "Urgent aid for conflict-affected populations.", "donation_url": "https://opencollective.com/sudan-emergency", "crisis_title": "Sudan Conflict"},
    {"name": "Venezuela Aid", "description": "Supporting Venezuelans affected by economic crisis.", "donation_url": "https://opencollective.com/venezuela-aid", "crisis_title": "Venezuela Economic Crisis"},
    {"name": "Gaza Emergency Fund", "description": "Providing humanitarian relief in Gaza.", "donation_url": "https://opencollective.com/gaza-relief", "crisis_title": "Gaza Humanitarian Crisis"},
    {"name": "UNRWA", "description": "UN agency supporting Palestine refugees.", "donation_url": "https://opencollective.com/unrwa", "crisis_title": "Gaza Humanitarian Crisis"},
    {"name": "Myanmar Humanitarian Mission", "description": "Supporting displaced communities in Myanmar.", "donation_url": "https://opencollective.com/myanmar-mission", "crisis_title": "Myanmar Civil Conflict"},
    {"name": "Morocco Earthquake Relief", "description": "Emergency aid for earthquake survivors in Morocco.", "donation_url": "https://opencollective.com/morocco-earthquake", "crisis_title": "Morocco Earthquake"},
    {"name": "Libya Flood Response", "description": "Disaster relief for flood-affected regions.", "donation_url": "https://opencollective.com/libya-floods", "crisis_title": "Libya Floods"},
    {"name": "Tigray Relief Fund", "description": "Food and medical aid for Tigray region.", "donation_url": "https://opencollective.com/tigray-relief", "crisis_title": "Tigray Humanitarian Crisis"},
    {"name": "CAR Humanitarian Action", "description": "Supporting civilians in Central African Republic.", "donation_url": "https://opencollective.com/car-humanitarian", "crisis_title": "Central African Republic Conflict"},
    {"name": "Somalia Emergency", "description": "Famine relief and water programs in Somalia.", "donation_url": "https://opencollective.com/somalia-emergency", "crisis_title": "Somalia Famine"},
    {"name": "Save the Children Somalia", "description": "Protecting children from famine and conflict.", "donation_url": "https://opencollective.com/stc-somalia", "crisis_title": "Somalia Famine"},
    {"name": "Nepal Rebuild", "description": "Reconstruction efforts in earthquake-affected areas.", "donation_url": "https://opencollective.com/nepal-rebuild", "crisis_title": "Nepal Earthquake Recovery"},
    {"name": "Arctic Conservation Fund", "description": "Protecting Arctic ecosystems and communities.", "donation_url": "https://opencollective.com/arctic-conservation", "crisis_title": "Arctic Ice Melt"},
    {"name": "Sahel Food Security", "description": "Agricultural support and food distribution in Sahel.", "donation_url": "https://opencollective.com/sahel-food", "crisis_title": "Sahel Food Crisis"},
    {"name": "Philippine Disaster Relief", "description": "Typhoon recovery and preparedness programs.", "donation_url": "https://opencollective.com/ph-disaster", "crisis_title": "Philippine Typhoons"},
    {"name": "Colombian Red Cross", "description": "Humanitarian aid for displaced Colombians.", "donation_url": "https://opencollective.com/colombia-redcross", "crisis_title": "Colombia Displacement Crisis"},
    {"name": "Congo Rainforest Alliance", "description": "Forest conservation and sustainable development.", "donation_url": "https://opencollective.com/congo-forest", "crisis_title": "Congo River Basin Deforestation"},
    {"name": "Iran Water Solutions", "description": "Water conservation and community support.", "donation_url": "https://opencollective.com/iran-water", "crisis_title": "Iranian Water Crisis"},
    {"name": "Australian Wildlife Fund", "description": "Supporting wildlife recovery after bushfires.", "donation_url": "https://opencollective.com/aus-wildlife", "crisis_title": "Australian Bushfire Recovery"},
    {"name": "South Sudan Relief", "description": "Emergency aid for conflict and flood victims.", "donation_url": "https://opencollective.com/south-sudan-relief", "crisis_title": "South Sudan Humanitarian Crisis"},
    {"name": "Malawi Health Response", "description": "Cholera treatment and prevention programs.", "donation_url": "https://opencollective.com/malawi-health", "crisis_title": "Malawi Cholera Outbreak"},
    {"name": "Nigeria Peace Initiative", "description": "Supporting conflict-affected communities in northeast Nigeria.", "donation_url": "https://opencollective.com/nigeria-peace", "crisis_title": "Nigerian Insurgency"},
    {"name": "Greece Fire Relief", "description": "Wildfire recovery and prevention programs.", "donation_url": "https://opencollective.com/greece-fire", "crisis_title": "Greece Wildfire Crisis"},
    # New charities for additional crises
    {"name": "Bangladesh Flood Relief", "description": "Emergency assistance for flood victims.", "donation_url": "https://opencollective.com/bangladesh-floods", "crisis_title": "Bangladesh Flooding"},
    {"name": "Mozambique Cyclone Fund", "description": "Cyclone recovery and resilience building.", "donation_url": "https://opencollective.com/mozambique-cyclone", "crisis_title": "Mozambique Cyclone Recovery"},
    {"name": "Chile Wildfire Relief", "description": "Supporting fire-affected communities.", "donation_url": "https://opencollective.com/chile-fire", "crisis_title": "Chile Wildfires"},
    {"name": "Japan Earthquake Relief", "description": "Emergency aid for earthquake survivors.", "donation_url": "https://opencollective.com/japan-earthquake", "crisis_title": "Japan Earthquake"},
    {"name": "Taiwan Red Cross", "description": "Disaster response and recovery.", "donation_url": "https://opencollective.com/taiwan-redcross", "crisis_title": "Taiwan Earthquake"},
    {"name": "Indonesia Disaster Fund", "description": "Volcanic and disaster emergency response.", "donation_url": "https://opencollective.com/indonesia-disaster", "crisis_title": "Indonesia Volcanic Activity"},
    {"name": "Kenya Red Cross", "description": "Flood emergency response.", "donation_url": "https://opencollective.com/kenya-redcross", "crisis_title": "Kenya Flooding"},
    {"name": "Brazil Flood Relief", "description": "Emergency aid for Rio Grande do Sul.", "donation_url": "https://opencollective.com/brazil-floods", "crisis_title": "Brazil Floods"},
    {"name": "Cameroon Peace Initiative", "description": "Supporting affected communities in Anglophone regions.", "donation_url": "https://opencollective.com/cameroon-peace", "crisis_title": "Cameroon Anglophone Crisis"},
    {"name": "Burkina Faso Relief", "description": "Humanitarian aid for displaced populations.", "donation_url": "https://opencollective.com/burkina-relief", "crisis_title": "Burkina Faso Insurgency"},
    {"name": "Mali Humanitarian Fund", "description": "Emergency assistance in conflict zones.", "donation_url": "https://opencollective.com/mali-humanitarian", "crisis_title": "Mali Conflict"},
    {"name": "Ecuador Emergency Fund", "description": "Security and humanitarian support.", "donation_url": "https://opencollective.com/ecuador-emergency", "crisis_title": "Ecuador Drug Trafficking Crisis"},
    {"name": "WHO Mpox Response", "description": "Emergency response to mpox outbreak.", "donation_url": "https://opencollective.com/who-mpox", "crisis_title": "Mpox Outbreak Africa"},
    {"name": "PAHO Dengue Fund", "description": "Dengue prevention and treatment.", "donation_url": "https://opencollective.com/paho-dengue", "crisis_title": "Dengue Epidemic Americas"},
    {"name": "UNICEF Gaza", "description": "Child health and vaccination programs.", "donation_url": "https://opencollective.com/unicef-gaza", "crisis_title": "Polio Resurgence Gaza"},
    {"name": "Great Barrier Reef Foundation", "description": "Reef conservation and restoration.", "donation_url": "https://opencollective.com/gbr-foundation", "crisis_title": "Great Barrier Reef Bleaching"},
    {"name": "Antarctica Climate Fund", "description": "Research and conservation efforts.", "donation_url": "https://opencollective.com/antarctica-climate", "crisis_title": "Antarctic Ice Sheet Collapse"},
    {"name": "California Drought Relief", "description": "Water conservation and community support.", "donation_url": "https://opencollective.com/ca-drought", "crisis_title": "California Drought"},
    {"name": "Tuvalu Climate Action", "description": "Climate adaptation for sinking islands.", "donation_url": "https://opencollective.com/tuvalu-climate", "crisis_title": "Tuvalu Sinking Islands"},
    {"name": "Lebanon Crisis Relief", "description": "Economic crisis humanitarian support.", "donation_url": "https://opencollective.com/lebanon-relief", "crisis_title": "Lebanon Economic Collapse"},
    {"name": "Sri Lanka Aid", "description": "Food and medicine distribution.", "donation_url": "https://opencollective.com/srilanka-aid", "crisis_title": "Sri Lanka Economic Crisis"},
    {"name": "Armenia Refugee Fund", "description": "Supporting displaced Armenians.", "donation_url": "https://opencollective.com/armenia-refugees", "crisis_title": "Nagorno-Karabakh Displacement"},
    {"name": "Chad Refugee Support", "description": "Hosting communities and refugee assistance.", "donation_url": "https://opencollective.com/chad-refugees", "crisis_title": "Chad Refugee Crisis"},
    {"name": "PNG Disaster Relief", "description": "Landslide emergency response.", "donation_url": "https://opencollective.com/png-disaster", "crisis_title": "Papua New Guinea Landslide"},
    {"name": "Iceland Volcanic Relief", "description": "Community support during eruptions.", "donation_url": "https://opencollective.com/iceland-volcanic", "crisis_title": "Iceland Volcanic Eruption"},
    {"name": "Mekong River Coalition", "description": "River ecosystem and community protection.", "donation_url": "https://opencollective.com/mekong-coalition", "crisis_title": "Mekong River Crisis"},
    {"name": "Jakarta Climate Fund", "description": "Addressing sinking city challenges.", "donation_url": "https://opencollective.com/jakarta-climate", "crisis_title": "Jakarta Sinking"}
]


def get_connection():
    """Create database connection from environment variables."""
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    database = os.getenv("DB_NAME", "globemap")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    
    conn_string = f"host={host} port={port} dbname={database} user={user} password={password}"
    return psycopg.connect(conn_string)


def seed_database():
    """Seed the database with sample data."""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        print("🌍 Seeding Global Problems Map database...")
        
        # Clear existing data
        cur.execute("DELETE FROM charities")
        cur.execute("DELETE FROM crises")
        
        # Insert crises
        crisis_ids = {}
        for crisis in CRISES:
            cur.execute("""
                INSERT INTO crises (title, category, country, latitude, longitude, severity, summary, description, start_date, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                crisis["title"],
                crisis["category"],
                crisis["country"],
                crisis["latitude"],
                crisis["longitude"],
                crisis["severity"],
                crisis["summary"],
                crisis["description"],
                crisis["start_date"],
                crisis["is_active"]
            ))
            crisis_ids[crisis["title"]] = cur.fetchone()[0]
            print(f"  ✓ Added crisis: {crisis['title']}")
        
        # Insert charities
        for charity in CHARITIES:
            crisis_id = crisis_ids.get(charity["crisis_title"])
            if crisis_id:
                cur.execute("""
                    INSERT INTO charities (name, description, donation_url, crisis_id)
                    VALUES (%s, %s, %s, %s)
                """, (
                    charity["name"],
                    charity["description"],
                    charity["donation_url"],
                    crisis_id
                ))
                print(f"  ✓ Added charity: {charity['name']}")
        
        conn.commit()
        print(f"\n✅ Successfully seeded {len(CRISES)} crises and {len(CHARITIES)} charities!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    seed_database()
