import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
openai.api_key = os.getenv('OPENAI_API_KEY')
weather_api_key = os.getenv('OPENWEATHER_API_KEY')
news_api_key = os.getenv('NEWS_API_KEY')

# Verify that API keys are available
if not openai.api_key or not weather_api_key or not news_api_key:
    print("Warning: One or more API keys are missing. Please check your .env file.")

def get_weather(city):
    """Fetch the weather data for a given city from OpenWeather API."""
    g = geocoder.osm(city)
    lat = g.lat
    lon = g.lng
    url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_api_key}'
    response = requests.get(url)
    
    if response.status_code == 200:
        weather_data = response.json()
        temperature = weather_data['main']['temp'] - 273.15
        weather_description = weather_data['weather'][0]['description']
        return f"The current temperature in {city} is {temperature:.2f}°C with {weather_description}."
    else:
        return "Sorry, I couldn't fetch the weather data right now."

def get_news(query):
    """Fetch the latest news articles from NewsAPI."""
    url = ('https://newsapi.org/v2/top-headlines?'
       'country=us&'
       f'q={query}&'
       f'apiKey={news_api_key}')
    response = requests.get(url)
    
    if response.status_code == 200:
        news_data = response.json()
        articles = news_data['articles'][:3]  # Get top 3 news articles
        news_headlines = []
        for article in articles:
            headline = article['title']
            description = article['description']
            news_headlines.append(f"Title: {headline}\nDescription: {description}\n")
        return '\n'.join(news_headlines)
    else:
        return "Sorry, I couldn't fetch the news data right now."

def generate_chatbot_reply(user_message, real_time_data):
    """Generate a response from OpenAI's GPT model including real-time data."""
    prompt = f":User  {user_message}\nAI (with real-time data): {real_time_data}"
    
    response = openai.Completion.create(
        model="text-davinci-003",  # You can change to a different model like GPT-4
        prompt=prompt,
        max_tokens=100
    )
    
    return response.choices[0].text.strip()

def chat_with_bot():
    """Main function to run the chatbot."""
    print("Welcome to the AI Chatbot! You can ask about the weather or latest news.")
    while True:
        user_input = input("You: ")
        
        # Check if the user is asking about the weather
        if "weather" in user_input.lower():
            city = input("Which city's weather would you like to know? ")
            real_time_data = get_weather(city)
            bot_response = generate_chatbot_reply(user_input, real_time_data)
        
        # Check if the user wants news
        elif "news" in user_input.lower():
            topic = input("What news topic would you like to know about? ")
            real_time_data = get_news(topic)
            bot_response = generate_chatbot_reply(user_input, real_time_data)
        
        else:
            real_time_data = ""  # No real-time data needed
            bot_response = generate_chatbot_reply(user_input, real_time_data)
        
        print("AI: " + bot_response)
        
        # Exit condition
        if user_input.lower() in ['exit', 'quit', 'bye']:
            print("Goodbye!")
            break

# Run the chatbot
chat_with_bot()