/*
  Name:        main.js
  Purpose:     Contains objects and a function to be used in other files. Creates new instances of classes. Accesses csv dataset and json database.

  Author:      Michelle Liu
  Created:     26-Sep-2024
  Updated:     25-Oct-2024
*/

// Importing classes needed from other files
import { DataConfig } from "./data-config.js";
import { LegendRender } from "./legend-render.js";
import { MapRender } from "./map-render.js";

// Object with country names from database as keys and country names from json data as values
// Needed for reconfiguring country names to be displayed in map
const countryConfig = {
    "Bolivia (Plurinational State of)":"Bolivia",
    "Bosnia and Herzegovina":"Bosnia and Herz.",
    "Brunei Darussalam": "Brunei",
    "Central African Republic": "Central African Rep.",
    "Democratic People's Republic of Korea": "North Korea",
    "Democratic Republic of the Congo": "Dem. Rep. Congo",
    "Dominican Republic": "Dominican Rep.",
    "Equatorial Guinea": "Eq. Guinea",
    "Iran (Islamic Republic of)": "Iran",
    "Lao People's Democratic Republic": "Laos",
    "Netherlands (Kingdom of the)": "Netherlands",
    "North Macedonia": "Macedonia",
    "occupied Palestinian territory": "Palestine",
    "Republic of Korea": "South Korea",
    "Republic of Moldova": "Moldova",
    "Russian Federation": "Russia",
    "Saint Vincent and the Grenadines": "St. Vin. and Gren.",
    "Sao Tome and Principe": "São Tomé and Principe",
    "Solomon Islands": "Solomon Is.",
    "South Sudan": "S. Sudan",
    "Syrian Arab Republic": "Syria",
    "The United Kingdom": "United Kingdom",
    "Türkiye": "Turkey",
    "United Republic of Tanzania": "Tanzania",
    "Viet Nam": "Vietnam"
}

// Income types in database as keys and 3 values as values to make tertiles for income data
const incomeConfig = {
    "Low income": 0, 
    "Lower middle income": 0, 
    "Upper middle income": 1, 
    "High income": 2
}

/** 
    * Sorts labour rate data into tertiles
    * 
    * @param {Number} value - labour force participation rate, as a percentage
    * 
    * @returns {Number} - either 0, 1, or 2 to represent low, medium, or high labour rates
    * 
    */
const labourConfig = (value) =>{
    if (value <= 45.0 ) {
        return 0
    } else if (45.0 < value && value <= 58.0) {
        return 1
    } else {
        return 2
    }
}

// Red and blue colour scheme
const BuRdColourScheme = [
    ["#c1b1c4", "#e39db2", "#d1607e"], 
    ["#9ed0de", "#a1819b", "#a65061"],
    ["#64acbe", "#627f8c", "#785664"]
]

// Purple and blue colour scheme
const PuBuColourScheme = [
    ["#c1c6db", "#ace4e4", "#5ac8c8"],
    ["#dfb0d6", "#a5add3", "#5698b9"], 
    ["#be64ac", "#8c62aa", "#3b4994"]
]

// Purple and yellow colour scheme
const PuYeColourScheme = [
    ["#c7bcb5", "#e4d9ac", "#c8b35a"],
    ["#cbb8d7", "#c8ada0", "#af8e53"],
    ["#9972af", "#976b82", "#804d36"]
]

// Creating multiple instances of the LegendRender class to give the map multiple colour schemes
const BuRdRender = new LegendRender(BuRdColourScheme)
const PuBuRender = new LegendRender(PuBuColourScheme)
const PuYeRender = new LegendRender(PuYeColourScheme)
const colourLegends = [BuRdRender, PuBuRender, PuYeRender]

// Initializes instances of the DataConfig and MapRender classes needed
const dataConfig = new DataConfig(countryConfig, incomeConfig, labourConfig)
const mapRender = new MapRender(colourLegends, dataConfig)

// Loads unicef database csv and geographical json data using try and catch for any errors with external data. Then, extracts data and uses it to parse data and render map. Also reacts to user clicks.
try {
    d3.queue()
        .defer(d3.csv, "assets/unicef-data.csv")
        .defer(d3.json, "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
        .awaitAll(function(error, results) {
            if (error) {
                throw new Error("Error loading data: " + error);
            }
        
        // Extract data from external sources
        const csvData = results[0]
        const jsonData = results[1]
        
        // Parse data using class instance
        dataConfig.parseData(csvData)
        // Render map using class instance
        mapRender.renderAll(jsonData)
        
        // D3 event to change the colour scheme on user's click
        d3.select("#map").on("click", () => mapRender.cycleLegends()) 
    })
} catch (error) {
    console.error(error.message);
}
