/*
  Name:        map-render.js
  Purpose:     Uses configured data from data-config to create a coloured map projection

  Author:      Michelle Liu
  Created:     26-Sep-2024
  Updated:     25-Oct-2024
*/

/**
 * @class MapRender
 * @description Renders world map with colours determined using configured data
 */
export class MapRender {
    /** 
    * @constructor Constructs instance of MapRender. Takes colour scheme for map and configured data. 
    * @param {Array} colourLegends - stores colour schemes to render the 3 x 3 legend according to data tertiles
    * @param {DataConfig} incomeConfig - instance of DataConfig that provides configured data for the countries on map
    */
    constructor(colourLegends, dataConfig) {
        this.colourLegends = colourLegends
        this.dataConfig = dataConfig
        this.countryMapping = {}
        this.countryTooltip = {}
        this.mapSvg = null
        this.currentIndex = 0
        this.legendContainer = null
    }
    
    /** 
    * @method renderAll
    * @description Public method encapsulating createMap method and private createLegend method.
    * 
    * @param {Object} jsonData - data with geographical features needed to render the map
    */
    renderAll(jsonData) {
        this.createMap(jsonData)
        this.legendContainer = this.mapSvg.append("g").attr("class", "legend-container")
        this.colourLegends[this.currentIndex].createLegend(this.legendContainer)
    }

    /**
     * @method cycleLegends
     * @description Public method cycling through the three colour legends to display a new one when user clicks (event created in main.js)
     */
    cycleLegends(){
        // Clears previous legend in the container
        this.legendContainer.selectAll("*").remove() 
        // Uses modulo to continuously cycle, with remainder as index
        this.currentIndex = (this.currentIndex + 1) % this.colourLegends.length 
        this.colourLegends[this.currentIndex].createLegend(this.legendContainer)

        // Initial filling of countries with data if it is present in the json dataset, otherwise makes the country a blank colour
        const currentColour = this.colourLegends[this.currentIndex].colourScheme 
        this.mapSvg.selectAll("path")
        .attr("fill", d => {
            let countryName = d.properties.name.toLowerCase()
            let onlyData = this.countryMapping[countryName]
            if (onlyData && currentColour[onlyData["income"]] && currentColour[onlyData["income"]][onlyData["labour"]]) {
                return currentColour[onlyData["income"]][onlyData["labour"]]
            } else {
                return "#dee3e3"
            }
        })
    }

    /** 
    * @method createMap
    * @description Public method encapsulating createMap method and private createLegend method.
    * 
    * @param {Object} jsonData - data with geographical features needed to render the map
    */
    createMap(jsonData) {
        // Defines map SVG dimensions and styling
        const width = window.innerWidth, height = (window.innerHeight-60);
        this.mapSvg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

        const projection = d3.geoMercator()
            .scale(175)
            .translate([width/2, height/1.7]);

        const path = d3.geoPath().projection(projection);
        const countries = topojson.feature(jsonData, jsonData.objects.countries).features; 
        
        // Maps country data sorted in DataConfig class to the displayed countries
        for (let i = 0, n = this.dataConfig.finalSort.length; i < n; i++) {
            let finalCountryData = this.dataConfig.finalSort[i]
            this.countryMapping[finalCountryData[0].toLowerCase()] = {income: finalCountryData[1], labour: finalCountryData[2]}
        }

        // Defines empty tooltip box that will be updated to show country name, income, and labour data when user hovers the country over with their cursor
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity",0)
            .style("position","absolute")
            .style("background","#ffffff")
            .style("padding","5px")
            .style("pointer-events", "none")         

        // Selects all path elements to bind country data and colours to them
        this.mapSvg.selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", path) // "d" attribute from json data
            .attr("stroke", "white")
            .attr("stroke-width", 0.4)
            // Updates colours of map based on user activity changing legend
            .attr("fill", d => this.#updateColours(d))
            // Updates tooltip based on user cursor movement to display data associated with countries
            .on("mouseover", function(d) {
                this.#updateTooltip(d, tooltip)
            }.bind(this))
            .on("mousemove", function() {
                tooltip.style("left",(d3.event.pageX+5)+"px")
                    .style("top", (d3.event.pageY-28)+"px")
            })
            .on("mouseout", function() {
                tooltip.transition().duration(100).style("opacity",0)
            })
            
        
        // Text showing note for uncoloured countries at bottom of map
        this.mapSvg.append("text")
            .attr("x", width/2)  
            .attr("y", height-70)  
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#ffffff")
            .text("* no data available for uncoloured countries")
    }
    
    /**
     * @method updateColours
     * @description updates the map with the desired colours (same as initial defining in cycleLegends method)
     * 
     * @param {Object} d 
     */

    #updateColours(d) {
        const currentColour = this.colourLegends[this.currentIndex].colourScheme
        let countryName = d.properties.name.toLowerCase()
        let onlyData = this.countryMapping[countryName]
        if (onlyData && currentColour[onlyData["income"]] && currentColour[onlyData["income"]][onlyData["labour"]]) {
            return currentColour[onlyData["income"]][onlyData["labour"]]
        } else {
            return "#dee3e3"
        }
    }

    /** 
    * @method updateTooltip
    * @description Updates tooltip with data about the country the user's cursor hovers over. Converts country data from numbers to strings to be displayed.
    * 
    * @param {Object} d - needs to be "d" for SVG to work, geographical data about country from json data
    * @param {Object} tooltip - tooltip element showing user map data, more description above where tooltip is defined
    * @private
    */
    #updateTooltip(d,tooltip) {
        for (let i = 0, n = this.dataConfig.secondSort.length; i < n; i++) {
            let secondCountryData = this.dataConfig.secondSort[i]
            this.countryTooltip[secondCountryData[0].toLowerCase()] = {income: secondCountryData[1], labour: secondCountryData[2]}
        }
        let countryName = d.properties.name.toLowerCase()
        let onlyData = this.countryTooltip[countryName]

        // Defines tooltip display styles and converts numerical income and labour data to strings
        if (onlyData) {
            tooltip.transition().duration(50).style("opacity", 0.8)
            tooltip.html(
                d.properties.name.toString() +`<br>`+
                `Income: ` + onlyData["income"] + `<br>`+
                `Labour: ` + onlyData["labour"].toString() + `%`
            )
            .style("left",(d3.event.pageX+5)+"px")
            .style("top", (d3.event.pageY-28)+"px")
        }
    }
}
