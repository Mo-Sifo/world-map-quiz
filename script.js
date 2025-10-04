let selectedCountries = new Set();
let currentQuestion = null;
let score = 0;
let streak = 0;
let highScore = 0;
let questions = [];
let availableQuestions = [];
let completedQuestions = new Set();
let svg, projection, path, g, zoom;
let timer;
let timeLeft = 60;
let palestinePaths = [];

// *** FINAL MASTER LOOKUP TABLE (Ensures all D3 names are covered) ***
const topojsonNameToIso2 = {
    // Standard countries (from the D3 TopoJSON map data)
    "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "American Samoa": "as", "Andorra": "ad", "Angola": "ao", 
    "Anguilla": "ai", "Antarctica": "aq", "Antigua and Barb.": "ag", "Argentina": "ar", "Armenia": "am", 
    "Aruba": "aw", "Australia": "au", "Austria": "at", "Azerbaijan": "az", "Bahamas": "bs", "Bahrain": "bh", 
    "Bangladesh": "bd", "Barbados": "bb", "Belarus": "by", "Belgium": "be", "Belize": "bz", "Benin": "bj", 
    "Bermuda": "bm", "Bhutan": "bt", "Bolivia": "bo",  
    "Botswana": "bw", 
    "Brazil": "br", "British Indian Ocean Territory": "io", "British Virgin Is.": "vg", "U.S. Virgin Is.": "vi", "Brunei": "bn", 
    "Bulgaria": "bg", "Burkina Faso": "bf", "Burundi": "bi", "Cambodia": "kh", "Cameroon": "cm", "Canada": "ca", 
    "Cabo Verde": "cv", "Cayman Is.": "ky", "Central African Rep.": "cf", "Chad": "td", "Chile": "cl", 
    "China": "cn", "Christmas Island": "cx", "Cocos (Keeling) Islands": "cc", "Colombia": "co", "Comoros": "km", 
    
    // Congo variations (Crucial Fixes)
    "Democratic Republic of the Congo": "cd", // Standard name
    "Dem. Rep. Congo": "cd", // D3/TopoJSON common abbreviation
    "Congo": "cg", // D3/TopoJSON common abbreviation
    
    "Cook Islands": "ck", "Costa Rica": "cr", 
    "Côte d'Ivoire": "ci", "Croatia": "hr", "Cuba": "cu", "Curaçao": "cw", "Cyprus": "cy", "Czech Republic": "cz", 
    "Denmark": "dk", "Djibouti": "dj", "Dominica": "dm", "Dominican Rep.": "do", "Ecuador": "ec", 
    "Egypt": "eg", "El Salvador": "sv", "Eq. Guinea": "gq", "Eritrea": "er", "Estonia": "ee", 
    
    "Swaziland": "sz", // Old D3 name for Eswatini
    
    "Ethiopia": "et", "Falkland Is.": "fk", "Faeroe Is.": "fo", "Fiji": "fj", "Finland": "fi", 
    "France": "fr", "Fr. Polynesia": "pf", "Gabon": "ga", "Gambia": "gm", "Georgia": "ge", "Germany": "de", 
    "Ghana": "gh", "Gibraltar": "gi", "Greece": "gr", "Greenland": "gl", "Grenada": "gd", "Guam": "gu", 
    "Guatemala": "gt", "Guernsey": "gg", "Guinea": "gn", "Guinea-Bissau": "gw", "Guyana": "gy", "Haiti": "ht", 
    "Honduras": "hn", "Hong Kong": "hk", "Hungary": "hu", "Iceland": "is", "India": "in", "Indonesia": "id", 
    "Iran": "ir", "Iraq": "iq", "Ireland": "ie", "Isle of Man": "im", "Italy": "it", 
    "Jamaica": "jm", "Japan": "jp", "Jersey": "je", "Jordan": "jo", "Kazakhstan": "kz", "Kenya": "ke", 
    "Kiribati": "ki", "North Korea": "kp", "South Korea": "kr", "Kuwait": "kw", "Kyrgyzstan": "kg", 
    "Laos": "la", "Latvia": "lv", "Lebanon": "lb", "Lesotho": "ls", "Liberia": "lr", "Libya": "ly", 
    "Liechtenstein": "li", "Lithuania": "lt", "Luxembourg": "lu", "Macau": "mo", 
    "Macedonia": "mk", // The D3 name (often used as alias for North Macedonia) 
    
    "Madagascar": "mg", "Malawi": "mw", "Malaysia": "my", "Maldives": "mv", "Mali": "ml", "Malta": "mt", 
    "Marshall Is.": "mh", "Mauritania": "mr", "Mauritius": "mu", "Mexico": "mx", "Micronesia": "fm", 
    "Moldova": "md", "Monaco": "mc", "Mongolia": "mn", "Montenegro": "me", "Montserrat": "ms", "Morocco": "ma", 
    "Mozambique": "mz", "Myanmar": "mm", "Namibia": "na", "Nauru": "nr", "Nepal": "np", "Netherlands": "nl", 
    "New Caledonia": "nc", "New Zealand": "nz", "Nicaragua": "ni", "Niger": "ne", "Nigeria": "ng", 
    "Niue": "nu", "Norfolk Island": "nf", "Northern Mariana Islands": "mp", "Norway": "no", "Oman": "om", 
    "Pakistan": "pk", "Palau": "pw", 
    "Palestinian National Authority": "ps", 
    "Panama": "pa", "Papua New Guinea": "pg", "Paraguay": "py", "Peru": "pe", "Philippines": "ph", 
    "Pitcairn Islands": "pn", "Poland": "pl", "Portugal": "pt", "Puerto Rico": "pr", "Qatar": "qa", 
    "Romania": "ro", "Russia": "ru", "Rwanda": "rw", "Saint Helena": "sh", 
    "St. Kitts and Nevis": "KN", "Saint Lucia": "lc", "Saint Pierre and Miquelon": "pm", 
    "Saint Vincent and the Grenadines": "vc", "Samoa": "ws", "San Marino": "sm", "São Tomé and Principe": "st", 
    "Saudi Arabia": "sa", "Senegal": "sn", "Serbia": "rs", "Seychelles": "sc", "Sierra Leone": "sl", 
    "Singapore": "sg", "Sint Maarten": "sx", "Slovakia": "sk", "Slovenia": "si", "Solomon Is.": "sb", 
    "Somalia": "so", "South Africa": "za", 
    "S. Sudan": "ss", // South Sudan
    "Spain": "es", "Sri Lanka": "lk", 
    "Sudan": "sd", "Suriname": "sr", "Svalbard and Jan Mayen": "sj", "Sweden": "se", "Switzerland": "ch", 
    "Syria": "sy", "Taiwan": "tw", "Tajikistan": "tj", "Tanzania": "tz", "Thailand": "th", "Togo": "tg", 
    "Tokelau": "tk", "Tonga": "to", "Trinidad and Tobago": "tt", "Tunisia": "tn", "Turkey": "tr", "Timor-Leste": "tl",
    "Turkmenistan": "tm", "Turks and Caicos Is.": "tc", "Tuvalu": "tv", "Uganda": "ug", "Ukraine": "ua", 
    "United Arab Emirates": "ae", "United Kingdom": "gb", 
    "United States of America": "us", 
    "Uruguay": "uy", "Uzbekistan": "uz", "Vanuatu": "vu", "Vatican City": "va", "Venezuela": "ve", 
    "Vietnam": "vn", "Wallis and Futuna Is.": "wf", "W. Sahara": "eh", "Yemen": "ye", "Zambia": "zm", 
    "Zimbabwe": "zw",
    // Disputed Territories and Neutral Zones
    "Kosovo": "xk",
    "N. Cyprus": "cy",
    "Somaliland": "so",
    "United Nations Neutral Zone": "un",
    "South Georgia and the South Sandwich Islands": "gs",
    // Custom/Aliased Names for consistency
    "Czechia": "cz",
    "Palestine": "ps", 
    "eSwatini": "sz",
    "North Macedonia": "mk",
    "United States": "us", 
    // Additional Aliases for D3 TopoJSON Compatibility
    "Bosnia and Herz.": "ba", // Bosnia and Herzegovina D3 alias // Another common D3 alias
    "Congo (Kinshasa)": "cd", // DRC alias
    "Congo (Brazzaville)": "cg", // Republic of the Congo alias
};

const customCountryNames = {
    "Israel": "Palestine",
    "United States": "United States of America",
    "United Kingdom": "United Kingdom",
    "Czech Republic": "Czechia",
    "eSwatini": "Eswatini",
    "Bosnia and Herz.": "Bosnia & Herzegovina",
    "W. Sahara": "Western Sahara",
    "Central African Rep.": "Central African Republic",
    "S. Sudan": "South Sudan",
    "N. Cyprus": "Northern Cyprus",
    "Antigua and Barb.": "Antigua and Barbuda",
    "St. Kitts and Nevis": "Saint Kitts and Nevis",
    "U.S. Virgin Is.": "U.S. Virgin Islands",
    "British Virgin Is.": "British Virgin Islands",
    "Dominican Rep.": "Dominican Republic",
    "Cayman Is.": "Cayman Islands",
    "faeroe Is.": "faeroe Islands",
    "falkland Is.": "falkland Islands",
    "Eq. Guinea": "Equatorial Guinea",
    "Côte d'Ivoire": "ivory Coast",
    "Cabo Verde": "Cape Verde",
    "São Tomé and Principe": "Sao Tome and Principe",
    "Timor-Leste": "East Timor",
    "Solomon Is.": "Solomon Islands",
    "Marshal Is.": "Marshall Islands",
    "Fr. Polynesia": "French Polynesia"
};

// --- Local Storage Functions (unchanged) ---

function loadProgress() {
    const storedScore = localStorage.getItem('highScore');
    if (storedScore) {
        highScore = parseInt(storedScore);
        document.getElementById('high-score').textContent = highScore;
    }
    const storedCompleted = localStorage.getItem('completedQuestions');
    if (storedCompleted) {
        completedQuestions = new Set(JSON.parse(storedCompleted));
    }
}

function saveProgress() {
    localStorage.setItem('completedQuestions', JSON.stringify(Array.from(completedQuestions)));
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        document.getElementById('high-score').textContent = highScore;
    }
}

// --- Map Initialization ---

function initMap() {
    const container = document.getElementById('world-map');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create Tooltip
    d3.select("body").append("div")
        .attr("id", "map-tooltip")
        .style("position", "absolute")
        .style("opacity", 0);

    svg = d3.select("#world-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    zoom = d3.zoom()
        .scaleExtent([1, 20])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);
    g = svg.append("g");

    projection = d3.geoMercator()
        .scale(180)
        .translate([width / 2, height / 1.7]);

    path = d3.geoPath().projection(projection);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json").then(function(world) {
        const countries = topojson.feature(world, world.objects.countries).features;

        g.selectAll("path")
            .data(countries)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "country")
            .each(function(d) {
                const countryName = customCountryNames[d.properties.name] || d.properties.name;
                if (countryName === "Palestine") {
                    palestinePaths.push(this);
                }
            })
            .on("click", function(event, d) {
                if (!currentQuestion) return;
                
                const countryName = customCountryNames[d.properties.name] || d.properties.name;
                const isPalestine = countryName === "Palestine";
                
                if (isPalestine) {
                    // Logic to handle Palestine multi-path selection
                    const isSelected = palestinePaths.some(path => d3.select(path).classed("selected"));
                    
                    palestinePaths.forEach(path => {
                        d3.select(path).classed("selected", !isSelected);
                        d3.select(path).attr("fill", !isSelected ? "var(--selected-color)" : "#3a86ff");
                    });
                    
                    if (isSelected) {
                        selectedCountries.delete("Palestine");
                    } else {
                        selectedCountries.add("Palestine");
                    }
                } else {
                    // Standard country selection logic
                    const isSelected = selectedCountries.has(countryName);
                    
                    if (isSelected) {
                        selectedCountries.delete(countryName);
                        d3.select(this).classed("selected", false)
                            .attr("fill", "#3a86ff");
                    } else {
                        selectedCountries.add(countryName);
                        d3.select(this).classed("selected", true)
                            .attr("fill", "var(--selected-color)");
                    }
                }
                
                updateSelectionCounter();
                updateSelectedCountriesDisplay();
                document.getElementById('submit-answer').disabled = 
                    selectedCountries.size < currentQuestion.required;
            })
            .on("mouseover", function(event, d) {
                // 1. Get the original map country name
                const originalName = d.properties.name;
                
                // 2. Get the official/custom display name
                const countryName = customCountryNames[originalName] || originalName;
                
                let iso2Code;
                
                // 3. PRIMARY LOOKUP: Check the original name from the map data
                iso2Code = topojsonNameToIso2[originalName];
                
                // 4. FALLBACK LOOKUP: Check the custom/alias name 
                if (!iso2Code) {
                    iso2Code = topojsonNameToIso2[countryName];
                }
                
                // 5. Final fallback
                if (!iso2Code) {
                    iso2Code = 'un'; // Default to UN if all lookups fail
                }

                // Construct the HTML with the flag icon
                const tooltipHTML = `
                    <span class="flag-icon flag-icon-${iso2Code.toLowerCase()}"></span>
                    <span>${countryName}</span>
                `;

                // Show tooltip
                d3.select("#map-tooltip").transition()
                    .duration(200)
                    .style("opacity", .9);
                d3.select("#map-tooltip").html(tooltipHTML)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");

                // Hover color change
                if (!d3.select(this).classed("selected") && 
                    !d3.select(this).classed("correct") && 
                    !d3.select(this).classed("incorrect") &&
                    !d3.select(this).classed("neutral")) {
                    d3.select(this).attr("fill", "#4895ef");
                }
            })
            .on("mousemove", function(event) {
                d3.select("#map-tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                // Hide tooltip
                d3.select("#map-tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                
                // Reset hover color
                if (!d3.select(this).classed("selected") && 
                    !d3.select(this).classed("correct") && 
                    !d3.select(this).classed("incorrect") &&
                    !d3.select(this).classed("neutral")) {
                    d3.select(this).attr("fill", "#3a86ff");
                }
            });
    });
}

function updateSelectedCountriesDisplay() {
    const container = document.getElementById('selected-countries');
    if (selectedCountries.size === 0) {
        container.innerHTML = "No countries selected";
        return;
    }
    
    container.innerHTML = Array.from(selectedCountries).map(country => 
        `<span class="country-tag">${country}</span>`
    ).join('');
}

function updateSelectionCounter() {
    const counter = document.getElementById('selection-counter');
    if (!currentQuestion) return;
    
    counter.textContent = `${selectedCountries.size}/${currentQuestion.required} selected`;
    counter.classList.toggle('complete', selectedCountries.size >= currentQuestion.required);
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 60; 
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.querySelector('.timer');
    timerElement.textContent = `${timeLeft}s`;
    
    if (timeLeft <= 10) {
        timerElement.classList.add('warning');
    } else {
        timerElement.classList.remove('warning');
    }
}

function loadQuestions() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            availableQuestions = [...questions]; 
            loadNextQuestion();
        });
}

function loadNextQuestion() {
    // If all questions have been completed, reset the completed set
    if (availableQuestions.length === 0) {
        if (completedQuestions.size === questions.length) {
             // All questions have been seen, reset the pool
            completedQuestions.clear();
        }
        availableQuestions = questions.filter(q => !completedQuestions.has(q.question));
    }

    if (availableQuestions.length === 0) {
        endGame();
        return;
    }

    // Pick a random question from the available list
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randomIndex];
    
    // Remove from available and add to completed set
    availableQuestions.splice(randomIndex, 1);
    completedQuestions.add(currentQuestion.question);
    saveProgress();


    selectedCountries.clear();
    
    document.getElementById('question-text').innerHTML = `
        ${currentQuestion.question} <br>
        <span id="selection-counter">0/${currentQuestion.required} selected</span>
    `;
    
    document.getElementById('submit-answer').style.display = 'block';
    document.getElementById('skip-question').style.display = 'block';
    document.getElementById('submit-answer').disabled = true;
    document.getElementById('next-question').style.display = 'none';
    document.getElementById('result').innerHTML = '';
    
    // Reset map colors
    d3.selectAll(".country")
        .classed("selected", false)
        .classed("correct", false)
        .classed("incorrect", false)
        .classed("neutral", false)
        .attr("fill", "#3a86ff")
        .attr("opacity", 1);
    
    updateSelectionCounter();
    updateSelectedCountriesDisplay();
    startTimer();
}

function skipQuestion() {
    if (!currentQuestion) return;

    clearInterval(timer);
    score = Math.max(0, score - 10); // Penalty of -10 points
    document.getElementById('score').textContent = score;
    streak = 0;
    document.getElementById('streak').textContent = streak;

    // Display a skip message
    document.getElementById('result').innerHTML = `
        <div class="result-header">
            <i class="fas fa-forward partial-icon"></i>
            <h3>Question Skipped! -10 Points Penalty.</h3>
        </div>
    `;

    // Visually mark the correct answers as missed (neutral)
    const correctAnswers = new Set(currentQuestion.answer);
    d3.selectAll(".country").each(function(d) {
        const countryName = customCountryNames[d.properties.name] || d.properties.name;
        if (correctAnswers.has(countryName)) {
            d3.select(this)
                .classed("neutral", true)
                .attr("fill", "var(--neutral-color)");
        }
    });

    // Hide submission and show next
    document.getElementById('submit-answer').style.display = 'none';
    document.getElementById('skip-question').style.display = 'none';
    document.getElementById('next-question').style.display = 'block';
}


function checkAnswer() {
    clearInterval(timer);
    
    const correctAnswers = new Set(currentQuestion.answer);
    let correctCount = 0;
    let extraCorrect = 0;
    let incorrectCount = 0;
    
    // 1. Tallying results
    selectedCountries.forEach(country => {
        if (correctAnswers.has(country)) {
            if (correctCount < currentQuestion.required) {
                correctCount++;
            } else {
                extraCorrect++;
            }
        } else {
            incorrectCount++;
        }
    });
    
    // 2. Scoring Calculation
    const basePercentage = Math.min(100, (correctCount / currentQuestion.required) * 100);
    const extraPercentage = Math.min(50, (extraCorrect / currentQuestion.required) * 50);
    const totalPercentage = basePercentage + extraPercentage;
    
    const pointsGained = Math.floor(totalPercentage / 10);
    const pointsPenalty = incorrectCount * 3; // 3 point penalty per incorrect selection
    const totalPointsChange = pointsGained - pointsPenalty;
    
    score += totalPointsChange;
    score = Math.max(0, score); // Score cannot go below 0
    document.getElementById('score').textContent = score;
    updateHighScore(); // Check for new high score
    
    // 3. Streak and Result Header
    let resultHTML = `<div class="result-summary">`;
    if (correctCount >= currentQuestion.required && incorrectCount === 0) {
        streak++;
        resultHTML += `
            <div class="result-perfect">
                <i class="fas fa-check-circle perfect-icon"></i>
                <div>
                    <h3>Perfect Answer!</h3>
                    <p>+${pointsGained} points, +1 Streak!</p>
                </div>
            </div>`;
    } else {
        streak = 0;
        let summaryText = totalPointsChange >= 0 ? 
            `+${totalPointsChange} net points (${pointsGained} earned, ${pointsPenalty} penalized)` :
            `${totalPointsChange} net points (${pointsGained} earned, ${pointsPenalty} penalized)`;

        resultHTML += `
            <div class="result-score">
                <i class="fas fa-dot-circle partial-icon"></i>
                <div>
                    <h3>Partial Result</h3>
                    <p>${summaryText}</p>
                </div>
            </div>
        `;
    }
    document.getElementById('streak').textContent = streak;

    // 4. Detailed Results (for incorrect/missed)
    if (incorrectCount > 0) {
        resultHTML += `<div class="result-detail incorrect"><i class="fas fa-times"></i> ${incorrectCount} Incorrect selection(s) (-${pointsPenalty} points)</div>`;
    }
    
    const missedCount = currentQuestion.required - correctCount;
    if (missedCount > 0) {
        const missedCountries = Array.from(correctAnswers).filter(c => !selectedCountries.has(c));
        resultHTML += `<div class="result-detail missed"><i class="fas fa-exclamation-triangle"></i> ${missedCount} Required country(s) missed: ${missedCountries.slice(0, 3).join(', ')}${missedCountries.length > 3 ? '...' : ''}</div>`;
    }
    
    resultHTML += `</div>`;
    document.getElementById('result').innerHTML = resultHTML;
    
    // 5. Update map colors and tags
    const requiredCorrect = Array.from(selectedCountries).filter(c => correctAnswers.has(c)).slice(0, currentQuestion.required);
    
    const selectedTags = document.querySelectorAll('.country-tag');
    selectedTags.forEach(tag => {
        const countryName = tag.textContent;
        if (correctAnswers.has(countryName)) {
            tag.classList.add('correct-tag');
            tag.classList.remove('incorrect-tag');
        } else {
            tag.classList.add('incorrect-tag');
            tag.classList.remove('correct-tag');
        }
    });
    
    d3.selectAll(".country").each(function(d) {
        const countryName = customCountryNames[d.properties.name] || d.properties.name;
        
        // Reset all classes before applying results
        d3.select(this).classed("selected", false).classed("correct", false).classed("incorrect", false).classed("neutral", false).attr("opacity", 1);

        if (correctAnswers.has(countryName)) {
            if (selectedCountries.has(countryName)) {
                // Correctly selected: highlight
                d3.select(this).classed("correct", true).attr("fill", "var(--correct-color)");
                
                // Optional: Differentiate extra correct selections (e.g., lower opacity)
                if (!requiredCorrect.includes(countryName)) {
                    d3.select(this).attr("opacity", 0.6);
                }
            } else {
                // Missed correct answer: neutral
                d3.select(this).classed("neutral", true).attr("fill", "var(--neutral-color)").attr("opacity", 0.8);
            }
        } else if (selectedCountries.has(countryName)) {
            // Incorrectly selected: wrong
            d3.select(this).classed("incorrect", true).attr("fill", "var(--wrong-color)").attr("opacity", 0.8);
        } else {
            // Unselected and incorrect: reset to default
            d3.select(this).attr("fill", "#3a86ff").attr("opacity", 1);
        }
    });

    // 6. Final UI update
    document.getElementById('submit-answer').style.display = 'none';
    document.getElementById('skip-question').style.display = 'none';
    document.getElementById('next-question').style.display = 'block';
}

function endGame() {
    clearInterval(timer);
    document.getElementById('question-text').textContent = "Game Over!";
    document.getElementById('submit-answer').style.display = 'none';
    document.getElementById('skip-question').style.display = 'none';
    document.getElementById('next-question').style.display = 'none';
    document.getElementById('result').innerHTML = `
        <div class="result-header">
            <i class="fas fa-trophy"></i>
            <h3>Final Score: ${score} (High Score: ${highScore})</h3>
        </div>
    `;
}

function zoomIn() {
    svg.transition().duration(300).call(zoom.scaleBy, 1.5);
}

function resetView() {
    svg.transition().duration(1000).call(zoom.transform, d3.zoomIdentity);
}

window.addEventListener('load', function() {
    loadProgress(); 
    initMap();
    loadQuestions();

    document.getElementById('submit-answer').addEventListener('click', checkAnswer);
    document.getElementById('next-question').addEventListener('click', loadNextQuestion);
    document.getElementById('skip-question').addEventListener('click', skipQuestion); 
    document.getElementById('zoom-in').addEventListener('click', zoomIn);
    document.getElementById('reset-view').addEventListener('click', resetView);

    window.addEventListener('resize', function() {
        d3.select("#world-map svg").remove();
        initMap();
    });
});