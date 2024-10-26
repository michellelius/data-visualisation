/*
  Name:        legend-render.js
  Purpose:     Renders legend by making the 3 x 3 grid given a colour scheme

  Author:      Michelle Liu
  Created:     26-Sep-2024
  Updated:     25-Oct-2024
*/

/**
 * @class LegendRender
 * @description Renders legends with different colour schemes
 */

export class LegendRender {
    /**
     * @constructor
     * @param {Array} colourScheme - a set of 9 colours for the 3 x 3 grid
     */
    constructor(colourScheme) {
        this.colourScheme = colourScheme; 
    }

    /**
     * @method createLegend
     * @description Creates a 3 x 3 legend, to show what map data means using the colours from colour scheme
     * 
     * @param {d3.selection} container - an SVG element where the legend element will be appended
     */
    createLegend(container) {
        // Defines dimension of legend
        const width = window.innerWidth, height = (window.innerHeight);
        const squareSide = 28

        // Rotates legend
        const legendGroup = container.append("g")
            .attr("transform", `translate(${width/5.61}, ${height/1.55}) rotate(225)`)
        
        // Defines dimensions of each of the 9 squares of legend and lines them up to make a 3 x 3 legend
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                legendGroup.append("rect")
                    .attr("x", i * squareSide - (3 * squareSide) / 2)  
                    .attr("y", j * squareSide - (3 * squareSide) / 2)  
                    .attr("width", squareSide)
                    .attr("height", squareSide)
                    .attr("fill", this.colourScheme[i][j]);  
            }
        }
        
        // Calls text function to make text for the legend, with increasing income being one side of the legend and increase labour rate being the other
        this.#createText(legendGroup, 60, "rotate(180)", "← Income")
        this.#createText(legendGroup, 60, "rotate(90)", "Labour Rate →")
        this.#createText(legendGroup, 100, "rotate(135)", "Click Map!")
    }

    /**
     * @method createText
     * @description Defining specifications of text attributes
     * 
     * @param {d3.selection} legendGroup - the d3 element the text will be appended to
     * @param {Number} y - y coordinate for text position
     * @param {String} transform - transformation applied to the text
     * @param {String} text - text to be displayed
     */
    #createText(legendGroup, y, transform, text) {
        legendGroup.append("text")
            .attr("x", 0)  
            .attr("y", y)  
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#ffffff")
            .attr("transform", transform)
            .text(text);
    }
}