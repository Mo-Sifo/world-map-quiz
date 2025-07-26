let selectedCountries = new Set();
let currentQuestion = null;
let score = 0;
let streak = 0;
let questions = [];
let svg, projection, path, g, zoom;
let timer;
let timeLeft = 30;
let palestinePaths = []; // Store references to Palestine territories

const customCountryNames = {
    "Israel": "Palestine",
    "United States": "United States of America",
    "United Kingdom": "United Kingdom",
    "Czech Republic": "Czechia"
};

function initMap() {
    const container = document.getElementById('world-map');
    const width = container.clientWidth;
    const height = container.clientHeight;

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
                // Store references to Palestine paths
                const countryName = customCountryNames[d.properties.name] || d.properties.name;
                if (countryName === "Palestine") {
                    palestinePaths.push(this);
                }
            })
            .on("click", function(event, d) {
                const countryName = customCountryNames[d.properties.name] || d.properties.name;
                const isPalestine = countryName === "Palestine";
                
                if (isPalestine) {
                    // Check if any Palestine territory is already selected
                    const isSelected = palestinePaths.some(path => 
                        d3.select(path).classed("selected")
                    );
                    
                    // Toggle all Palestine territories
                    palestinePaths.forEach(path => {
                        if (isSelected) {
                            d3.select(path).classed("selected", false)
                                .attr("fill", "#3a86ff");
                        } else {
                            d3.select(path).classed("selected", true)
                                .attr("fill", "var(--selected-color)");
                        }
                    });
                    
                    // Update selection set
                    if (isSelected) {
                        selectedCountries.delete("Palestine");
                    } else {
                        selectedCountries.add("Palestine");
                    }
                } else {
                    // Normal country selection
                    if (selectedCountries.has(countryName)) {
                        selectedCountries.delete(countryName);
                        d3.select(this).classed("selected", false)
                            .attr("fill", "#3a86ff");
                    } else {
                        selectedCountries.add(countryName);
                        d3.select(this).classed("selected", true)
                            .attr("fill", "var(--selected-color)");
                    }
                }
                
                updateSelectedCountriesDisplay();
                document.getElementById('submit-answer').disabled = selectedCountries.size === 0;
            })
            .on("mouseover", function(event, d) {
                if (!d3.select(this).classed("selected") && 
                    !d3.select(this).classed("correct") && 
                    !d3.select(this).classed("incorrect")) {
                    d3.select(this).attr("fill", "#4895ef");
                }
            })
            .on("mouseout", function(event, d) {
                if (!d3.select(this).classed("selected") && 
                    !d3.select(this).classed("correct") && 
                    !d3.select(this).classed("incorrect")) {
                    d3.select(this).attr("fill", "#3a86ff");
                }
            });
    });
}

function updateSelectedCountriesDisplay() {
    const selectedCountriesDiv = document.getElementById('selected-countries');
    selectedCountriesDiv.innerHTML = selectedCountries.size > 0 
        ? `<strong>Selected:</strong> ${Array.from(selectedCountries).join(', ')}`
        : 'No countries selected';
}

// ... (keep all other existing functions exactly as they were) ...

function loadQuestions() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            loadNextQuestion();
        })
        .catch(error => console.error('Error loading questions:', error));
}

function loadNextQuestion() {
    if (questions.length === 0) {
        document.getElementById('question-text').textContent = 'Quiz Completed!';
        document.getElementById('submit-answer').style.display = 'none';
        document.getElementById('next-question').style.display = 'none';
        document.getElementById('result').innerHTML = `<p>Final score: ${score}</p>`;
        return;
    }

    currentQuestion = questions.splice(Math.floor(Math.random() * questions.length), 1)[0];
    document.getElementById('question-text').textContent = currentQuestion.question;
    document.getElementById('submit-answer').style.display = 'block';
    document.getElementById('submit-answer').disabled = true;
    document.getElementById('next-question').style.display = 'none';
    document.getElementById('result').textContent = '';
    selectedCountries.clear();
    updateSelectedCountriesDisplay();
    
    // Reset map colors
     d3.selectAll(".country")
        .classed("selected", false)
        .classed("correct", false)
        .classed("incorrect", false)
        .classed("neutral", false)
        .attr("fill", "#3a86ff");
    
    // Start timer
    resetTimer();
    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 30;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 10) {
            document.querySelector('.timer').style.color = '#ff5252';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    document.querySelector('.timer').style.color = 'var(--accent-color)';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    document.querySelector('.timer').textContent = `${timeLeft}s`;
}

function checkAnswer() {
    clearInterval(timer);
    const correctAnswers = new Set(currentQuestion.answer);
    const correctSelected = Array.from(selectedCountries).filter(country => correctAnswers.has(country));
    const incorrectSelected = Array.from(selectedCountries).filter(country => !correctAnswers.has(country));
    const missedCountries = Array.from(correctAnswers).filter(country => !selectedCountries.has(country));

    // Update map colors
    d3.selectAll(".country").each(function(d) {
        const countryName = customCountryNames[d.properties.name] || d.properties.name;
        if (correctAnswers.has(countryName)) {
            if (selectedCountries.has(countryName)) {
                d3.select(this).classed("correct", true);
            } else {
                d3.select(this).classed("neutral", true);
            }
        } else if (selectedCountries.has(countryName)) {
            d3.select(this).classed("incorrect", true);
        }
    });

    // Calculate score
    const correctCount = correctSelected.length;
    const incorrectCount = incorrectSelected.length;
    const points = Math.max(0, correctCount * 5 - incorrectCount * 2);
    score += points;
    
    // Create result HTML
    let resultHTML = `<div class="result-summary">`;
    
    if (correctCount === correctAnswers.size && incorrectCount === 0) {
        streak++;
        resultHTML += `
            <div class="result-perfect">
                <i class="fas fa-trophy"></i>
                <div>
                    <h3>Perfect Answer!</h3>
                    <p>+${points} points</p>
                </div>
            </div>
            <div class="result-detail correct">
                <i class="fas fa-check-circle"></i>
                <span>All correct: ${correctSelected.join(', ')}</span>
            </div>
            <div class="streak-display">
                <i class="fas fa-bolt"></i> Current streak: ${streak}
            </div>
        `;
    } else {
        streak = 0;
        resultHTML += `
            <div class="result-score">
                <h3>Your score: +${points} points</h3>
            </div>
        `;
        
        if (correctCount > 0) {
            resultHTML += `
                <div class="result-detail correct">
                    <i class="fas fa-check-circle"></i>
                    <span>Correct: ${correctSelected.join(', ')}</span>
                </div>
            `;
        }
        
        if (incorrectCount > 0) {
            resultHTML += `
                <div class="result-detail incorrect">
                    <i class="fas fa-times-circle"></i>
                    <span>Incorrect: ${incorrectSelected.join(', ')}</span>
                </div>
            `;
        }
        
        if (missedCountries.length > 0) {
            resultHTML += `
                <div class="result-detail missed">
                    <i class="fas fa-question-circle"></i>
                    <span>Missed: ${missedCountries.join(', ')}</span>
                </div>
            `;
        }
    }
    
    resultHTML += `</div>`;
    document.getElementById('result').innerHTML = resultHTML;

    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('submit-answer').style.display = 'none';
    document.getElementById('next-question').style.display = 'block';
}

function zoomIn() {
    svg.transition().duration(300).call(zoom.scaleBy, 1.5);
}

function resetView() {
    svg.transition().duration(1000).call(zoom.transform, d3.zoomIdentity);
}

window.addEventListener('load', function() {
    initMap();
    loadQuestions();

    document.getElementById('submit-answer').addEventListener('click', checkAnswer);
    document.getElementById('next-question').addEventListener('click', loadNextQuestion);
    document.getElementById('zoom-in').addEventListener('click', zoomIn);
    document.getElementById('reset-view').addEventListener('click', resetView);

    window.addEventListener('resize', function() {
        d3.select("#world-map svg").remove();
        initMap();
    });
});