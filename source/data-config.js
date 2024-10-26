/*
  Name:        data-config.js
  Purpose:     Configures data from database for use in map visualisation

  Author:      Michelle Liu
  Created:     26-Sep-2024
  Updated:     25-Oct-2024
*/

/**
 * @class DataConfig
 * @description Prepares data for visualisation by sorting dataset from database
 */
export class DataConfig {
    /** 
    * @constructor
    * @param {Object} countryConfig - stores country names from database as keys and country names from map visualisation data as values to be configured to
    * @param {Object} incomeConfig - stores income levels from database as keys and income levels as numbers as values to be configured to
    * @param {Function} labourConfig - detailed function documentation in main.js, configures labour rates from percentages to tertiles
    *
    */
    constructor(countryConfig, incomeConfig, labourConfig) {
        this.countryConfig = countryConfig
        this.incomeConfig = incomeConfig
        this.labourConfig = labourConfig
        this.firstSort = []
        this.secondSort = []
        this.finalSort = []
    }

    /** 
    * @method parseData
    * @description Public method encapsulating the three private data parsing methods
    * 
    * @param {Array} csvData - detailed description in main.js, csv data to be parsed
    */
    parseData(csvData) {
        this.#firstParseData(csvData)
        this.#secondParseData()
        return this.#finalParseData()
    }

    /** 
    * @method firstParseData
    * @description First method takes all csv data and narrows it to the income and labour info needed. It passes that data as an object to the firstSort array. Also converts labour rate from a string to float to round the percentage to one decimal place. 
    * 
    * @param {Array} csvData - csv data to be parsed, detailed description in main.js
    * @private
    */
    #firstParseData(csvData) {
        for (let i = 0, n = csvData.length; i < n; i++) {
            if (csvData[i]["indicator_name"] === "Labour force participation rate (%) - Female" && 
                csvData[i]["dimension"] === "Place of residence") {
                const firstCountryData = {
                    country: csvData[i]["setting"], 
                    residence: csvData[i]["subgroup"],
                    income: csvData[i]["wbincome2024"],
                    labour: parseFloat(csvData[i]["estimate"]).toFixed(1) // Converted labour rate
                }
                this.firstSort.push(firstCountryData)
            }
        }
    }

    /** 
    * @method secondParseData
    * @description Second method further parses data, using modulo 2 to specify income category to rural areas (instead of urban and rural). Configures country names from csv data to country names from map visualisation data.
    * 
    * @private
    * 
    */
    #secondParseData() {
        for (let i = 0, n = this.firstSort.length; i < n; i++) {
            if (this.firstSort[i]["income"] !== undefined &&
                this.firstSort[i]["income"] !== "" && i % 2 === 0) {
                let finalCountry = this.countryConfig[this.firstSort[i]["country"]] || this.firstSort[i]["country"]

                this.secondSort.push([finalCountry, this.firstSort[i]["income"], this.firstSort[i]["labour"]])
            }
        }
    }

    /** 
    * @method finalParseData
    * @description Final method configures income and labour values into tertiles to be colour coded with the legend through map rendering.
    * 
    * @private
    * 
    */
    #finalParseData() {
        for (let i = 0, n = this.secondSort.length; i < n; i++) {
            let finalIncome = this.incomeConfig[this.secondSort[i][1]]
            let finalLabour = this.labourConfig(this.secondSort[i][2])

            this.finalSort.push([this.secondSort[i][0], finalIncome, finalLabour])
        }
    }
}

