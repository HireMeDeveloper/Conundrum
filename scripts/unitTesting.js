runStatisticsTests()

function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

function statisticsUnitTest(testName, cumulativeData, expectedResults) {
    let results = processStats(cumulativeData);
    if (deepEqual(expectedResults, results)) {
        console.log("TEST (" + testName + "): PASSED");
    } else {
        console.log("TEST (" + testName + "): FAILED");
        console.log("Expected: " + JSON.stringify(expectedResults, null, 2) + " \nActual: " + JSON.stringify(results, null, 2));
    }
}

function runStatisticsTests() {
    statisticsUnitTest(
        'test-1',
        [
            { number: 54, games: 1, wins: 0, hints: 0, countedHints: 0 },
            { number: 55, games: 3, wins: 1, hints: 1, countedHints: 1 }
        ],
        {
            today: {
                streak: 2,
                gamesPlayed: 3,
                wins: 1,
                hints: 1,
                countedHints: 1,
                gradeText: "30%"
            },
            overall: {
                daysPlayed: 2,
                gamesPlayed: 4,
                wins: 1,
                hints: 1,
                countedHints: 1,
                gradeText: "23%"
            }
        }
    )

    statisticsUnitTest(
        'test-2',
        [
            { number: 20, games: 1, wins: 1, hints: 0, countedHints: 0 },
            { number: 21, games: 2, wins: 2, hints: 1, countedHints: 1 },
            { number: 22, games: 1, wins: 0, hints: 0, countedHints: 0 },
            { number: 24, games: 3, wins: 1, hints: 1, countedHints: 1 }
        ],
        {
            today: {
                streak: 1,
                gamesPlayed: 3,
                wins: 1,
                hints: 1,
                countedHints: 1,
                gradeText: "30%"
            },
            overall: {
                daysPlayed: 4,
                gamesPlayed: 7,
                wins: 4,
                hints: 2,
                countedHints: 2,
                gradeText: "54%" // 55?
            }
        }
    )

    statisticsUnitTest(
        'test-3',
        [
            { number: 1, games: 1, wins: 1, hints: 0, countedHints: 0 },
            { number: 2, games: 2, wins: 2, hints: 1, countedHints: 1 },
            { number: 3, games: 1, wins: 0, hints: 0, countedHints: 0 },
            { number: 4, games: 3, wins: 1, hints: 1, countedHints: 0 },
            { number: 5, games: 1, wins: 1, hints: 0, countedHints: 0 },
            { number: 6, games: 2, wins: 2, hints: 1, countedHints: 1 },
            { number: 8, games: 1, wins: 0, hints: 0, countedHints: 0 },
            { number: 9, games: 3, wins: 1, hints: 1, countedHints: 1 },
            { number: 10, games: 1, wins: 1, hints: 0, countedHints: 0 },
            { number: 11, games: 2, wins: 2, hints: 1, countedHints: 1 },
            { number: 12, games: 1, wins: 0, hints: 0, countedHints: 0 },
            { number: 13, games: 3, wins: 3, hints: 0, countedHints: 0 }
        ],
        {
            today: {
                streak: 6,
                gamesPlayed: 3,
                wins: 3,
                hints: 0,
                countedHints: 0,
                gradeText: "100%"
            },
            overall: {
                daysPlayed: 12,
                gamesPlayed: 21,
                wins: 14,
                hints: 5,
                countedHints: 4,
                gradeText: "65%" // 64?
            }
        }
    )
}

runTimerUnitTests()

function timerUnitTest(testName, wordSize, expectedResult) {
    let results = getTimerDuration(wordSize);
    if (results === expectedResult) {
        console.log("TEST (" + testName + "): PASSED");
    } else {
        console.log("Test (" + testName + "): FAILED with RESULT: " + results + " and EXPECTED: " + expectedResult)
    }
}

function runTimerUnitTests() {
    timerUnitTest("test 1", 7, 3000)
    timerUnitTest("test 2", 8, 4000)
    timerUnitTest("test 3", 9, 5000)
}