"use client"
import { useState, useEffect } from "react";
import Image from 'next/image'

export default function Home() {
  const [city, setCity] = useState<{lat: string, lon: string, name: string | null}>({
    lat: "",
    lon: "",
    name: null
  })

  const [currentWeather, setCurrentWeather] = useState({
    temperature: 0,
    humidity: 0, 
    rain: 0,
    weatherCode: 0,
    windSpeed: 0
  })

  const [input, setInput] = useState("")
  const [search, setSearch] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("city") || "new york"
    }
    return "new york"
  })

  useEffect(() => {
    // Fetch the latitude and longitude from geocoding api 
    const getCoordinates = async (query: string) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${query}&format=jsonv2`)
        const cityInfo = await response.json()

        if (!response.ok) {
          throw new Error("Error ocured while trying to download city info.")
        }

        if (!cityInfo || cityInfo.length === 0) {
          throw new Error("Error ocured while trying to download city info.")
        }
        
        // Assign fetched city to state city
        setCity({
          lat: cityInfo[0].lat,
          lon: cityInfo[0].lon,
          name: cityInfo[0].name
        })
      } catch(error) {
        console.log("Error ocured while trying to download city info: ", error)
        setCity((prev) => ({ ...prev, name: "Error ocured while trying to download city info."}))
      }
    }
    getCoordinates(search)
    localStorage.setItem("city", search)
  }, [search])

  useEffect(() => {
    // Fetch the weather data from latitude and longitude given from city state 
    const getCurrentWeather = async (lat: string, lon: string) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,showers,weather_code,wind_speed_10m`)
        const weather = await response.json()

        if (!response.ok) {
          throw new Error("Error ocured while trying to download weather info.")
        }

        if (!weather || !weather.current) {
          throw new Error("Error ocured while trying to download weather info.")
        }

        // Assign fetched current weather data to current weather state 
        setCurrentWeather({
          temperature: weather.current.temperature_2m,
          humidity: weather.current.relative_humidity_2m, 
          rain: weather.current.rain,
          weatherCode: weather.current.weather_code,
          windSpeed: weather.current.wind_speed_10m
        })
        //console.log(weather)
      } catch(error) {
        console.log("Error ocured while trying to download weather info: ", error)
        setCity((prev) => ({ ...prev, name: "Error ocured while trying to download weather info."}))
      }
    }
    getCurrentWeather(city.lat, city.lon)
    
  }, [city.lat, city.lon])

  // Get the weather code and return weather icon to load
  const getWeatherIcon = (code: number) => {
    switch (code){
      case 0:
        return "/weather-icons/sun.png"
      case 1:
      case 2:
      case 3:
        return "/weather-icons/sun-cloud.png"
      case 45:
      case 48:
        return "/weather-icons/clouds.png"
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
        return "/weather-icons/sun-cloud-rain.png"
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
        return "/weather-icons/cloud-rain.png"
      case 71:
      case 73:
      case 75:
      case 77:
        return "/weather-icons/cloud-snow.png"
      case 81:
      case 82:
        return "/weather-icons/cloud-rain.png"
      case 85:
      case 86:
        return "/weather-icons/snow.png"
      case 95:
      case 96:
      case 99:
        return "/weather-icons/cloud-thunder-rain.png"
    }
    
  }
  
  // Handle pressing enter on input field
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearch(input)
      setInput("")
    }
  }

  return (
    <>
      <div className="bg-gray-600 w-78 h-96 flex-col justify-items-center grid auto-cols-auto  rounded-xl mt-20 ">
        <div className="flex-row text-black">
          <input className="bg-gray-300 w-52 rounded-xl drop-shadow-xl m-2 p-1 focus:outline-none" type="text" name="city" id="city" placeholder="Search a city" onKeyDown={handleKeyDown} value={input} onChange={(e) => {setInput(e.target.value)}}/>
          <button className="bg-green-500 rounded-xl drop-shadow-xl m-2 p-1" id="search" onClick={() => {setSearch(input); setInput("")}}>Search</button>
        </div>
        
        <h1 className="text-4xl ">{city.name}</h1><br />
        <div className="flex flex-row items-center bg-green-500 rounded-xl p-4 drop-shadow-xl">
          <Image className="mr-4" width={58} height={58} src={String(getWeatherIcon(currentWeather.weatherCode))} alt="Weather icon" />
          <h1 className="text-2xl">{currentWeather.temperature} °C</h1> <br />
        </div>
        
        <div className="flex flex-row items-center justify-center space-x-8 bg-gray-400 rounded-xl h-20 mt-4 drop-shadow-xl">
          <span className="m-4"><Image className="w-6 mb-2" width={60} height={60} src="/weather-icons/humidity.png" alt="Humidity" /> {currentWeather.humidity} %</span>
          <span className="m-4"><Image className="w-10 mb-2" width={60} height={60} src="/weather-icons/cloud-rain.png" alt="Rain amount" /> {currentWeather.rain} mm</span>
          <span className="m-4"><Image className="w-10 mb-4" width={60} height={60} src="/weather-icons/cloud-wind.png" alt="Wind speed" /> {currentWeather.windSpeed} km/h</span>
        </div>
      </div>
    </>
  );
}
