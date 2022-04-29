function conversationTypes(overview) {
    overview = overview.split(";");
    new Chart("conversationTypes", {
        type: "pie",
        data: {
            labels: new Array("One person", "Two person", "Groups"),
            datasets: [{
                backgroundColor: ["#3a0", "#8a0", "#ba0"],
                data: overview
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 20
                        },
                        color: "black"
                    }
                },
                title: {
                    font: {
                        size: 30,
                    },
                    color: "black",
                    display: true,
                    text: "Conversation Types Chart"
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: "2",
                    padding: 10,
                    bodyColor: "black",
                    bodyFont: {
                        size: 22,
                        weight: 'bold'
                    },
                    displayColors: true
                },
            }
        }
    });
}
function yearActivityAnalyse(yearActivity) {
    yearActivity = JSON.parse(yearActivity.replaceAll("&#34;", "\""));
    new Chart("yearActivityAnalyse", {
        type: "bar",
        data: {
            labels: Object.keys(yearActivity),
            datasets: [{
                backgroundColor: "rgba(000, 192, 0)",
                hoverBackgroundColor: "rgba(000, 216, 0)",
                data: Object.values(yearActivity)
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: "2",
                    titleColor: "black",
                    titleFont: {
                        size: 20,
                    },
                    bodyColor: "black",
                    bodyFont: {
                        size: 18,
                    },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: (data) => {
                            return `In year ${data[0]["label"]}`;
                        },
                        label: (data) => {
                            return `You sent ${data["formattedValue"]} messages`;
                        }
                    }
                },
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    font: {
                        size: 30
                    },
                    color: "black",
                    text: "Your activity over the years"
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: "black",
                        font: {
                            size: 18
                        }
                    }
                },
                x: {
                    ticks: {
                        color: "black",
                        font: {
                            size: 18
                        }
                    }
                }
            }
        }
    });
}
function hourActivityAnalyse(hourActivity) {
    hourActivity = JSON.parse(hourActivity.replaceAll("&#34;", "\""))
    new Chart("hourActivityAnalyse", {
        type: "bar",
        data: {
            labels: Object.keys(hourActivity),
            datasets: [{
                backgroundColor: "rgba(000, 192, 0)",
                hoverBackgroundColor: "rgba(000, 216, 0)",
                data: Object.values(hourActivity)
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: "2",
                    titleColor: "black",
                    titleFont: {
                        size: 20,
                    },
                    bodyColor: "black",
                    bodyFont: {
                        size: 18,
                    },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: (data) => {
                            return `Between ${data[0]["label"]}:00 and ${(Number(data[0]["label"]) + 1)}:00`;
                        },
                        label: (data) => {
                            return `You sent ${data["formattedValue"]} messages`;
                        }
                    }
                },
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    font: {
                        size: 30
                    },
                    color: "black",
                    text: "Hours in which you write the most"
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: "black",
                        font: {
                            size: 18
                        }
                    }
                },
                x: {
                    ticks: {
                        color: "black",
                        font: {
                            size: 18
                        },
                        callback: function (data) {
                            return `${data}:00 - ${Number(data) + 1}:00`;
                        }
                    }
                }
            }
        }
    });
}
function messagesSentConversations(overview, allMessagesSent, allMessagesReceived) {
    overview = JSON.parse(overview.replaceAll("&#34;", "\""));
    let labels = new Array(), values = new Array(), values2 = new Array();
    for (let i =0;i <overview.length;i++ ) {
        labels.push(overview[i][1].title || overview[i][0]);
        values.push(overview[i][1].pMessages);
        values2.push(overview[i][1].oMessages);
    }
    new Chart("sent", {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                backgroundColor: "rgba(0, 192, 0)",
                hoverBackgroundColor: "rgba(0, 216, 0)",
                data: values
            },{
                backgroundColor: "rgba(64, 150, 64)",
                hoverBackgroundColor: "rgba(64, 200, 64)",
                data: values2
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: "2",
                    titleColor: "black",
                    titleFont: {
                        size: 20,
                    },
                    bodyColor: "black",
                    bodyFont: {
                        size: 18,
                    },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: (data)=>{return (data[0].datasetIndex===0) ? "Messages sent by You" : `Messages sent by ${data[0].label}`},
                        label: (data)=>{return `Messages: ${data.formattedValue}`},
                        afterLabel: (data)=>{
                            if (data.datasetIndex===0) return `% of all Messages: ${(data.parsed.y/allMessagesSent*100).toFixed(2)}%`;
                            else return `% of all Messages: ${(data.parsed.y/allMessagesReceived*100).toFixed(2)}%`;
                        }
                    }
                },
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    font: {
                        size: 30
                    },
                    color: "black",
                    text: "People you write the most"
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: "black",
                        font: {
                            size: 18
                        }
                    }
                },
                x: {
                    ticks: {
                        color: "black",
                        font: {
                            size: 18
                        },
                    }
                }
            }
        }
    });
}