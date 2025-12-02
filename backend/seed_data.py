#!/usr/bin/env python3
"""
Seed script for Global Problems Map database.
Populates the database with sample crisis and charity data.
"""

import os
import psycopg2
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
    {"name": "Venezuela Aid", "description": "Supporting Venezuelans affected by economic crisis.", "donation_url": "https://opencollective.com/venezuela-aid", "crisis_title": "Venezuela Economic Crisis"}
]


def get_connection():
    """Create database connection from environment variables."""
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "globemap"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres")
    )


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
