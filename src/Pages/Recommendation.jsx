import { useReducer, useCallback, useEffect } from "react"
import { SelectField } from "../Components/Select"
import Genre from "../store/genre.json"
import Mood from "../store/mood.json"


const initialState = {
    genre: '',
    mood: '',
    level: '',
    availableMoodBasedOnGenre: [],
    isLoading: false,
    aiResponses: []

}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_GENRE':
            return {
                ...state,
                genre: action.selectData,

            }
        case 'SET_MOOD':
            return {
                ...state,
                mood: action.selectData
            }

        case 'SET_LEVEL':
            return {
                ...state,
                level: action.selectData
            }

        case 'ADD_RESPONSE':
            return {
                ...state,
                aiResponses: [...state.aiResponses, action.responseData]
            }

        case 'UPDATE_MOOD':
            return {
                ...state,
                availableMoodBasedOnGenre: action.moodList
            }

        case 'LOADING':
            return {
                ...state,
                isLoading: action.isLoading
            }

        default: return state;



    }
}

export function Recommendation() {
    const [state, dispatch] = useReducer(reducer, initialState)
    useEffect(() => {
        dispatch({ type: 'UPDATE_MOOD', moodList: Mood[state.genre] || [] })
    }, [state.genre])

    const fetchRecommendations = useCallback(async () => {
        if (!state.genre || !state.mood || !state.level) return;
        dispatch({ type: 'LOADING', isLoading: true })

        try {
            const url =
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

            const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `Recommend 6 books for a ${state.level} ${state.genre} reader feeling ${state.mood}. Explain why.` }]
                    }]
                })
            });
            const data = await response.json();
            console.log("Response:", data);
            dispatch({
                type: 'ADD_RESPONSE',
                responseData: data?.candidates[0]
            });

        } catch (err) {
            console.error("Error:", err);
        } finally { dispatch({ type: 'LOADING', isLoading: false }) }


    }, [state.genre, state.mood, state.level])

    return (<section>
        <div className="parent-wrap">
            <div className="select-container">
                <SelectField
                    placeholder="Please select a genre"
                    id="genre"
                    options={Genre}
                    onSelect={(e) => dispatch({ type: 'SET_GENRE', selectData: e.target.value })}
                    value={state.genre}
                />

                <SelectField
                    placeholder="Please select a mood"
                    id="mood"
                    options={state.availableMoodBasedOnGenre}
                    onSelect={(e) => dispatch({ type: 'SET_MOOD', selectData: e.target.value })}

                />

                <SelectField
                    placeholder="Please select a level"
                    id="level"
                    options={['Beginner', "Intermediate", "Expert"]}
                    onSelect={(e) => dispatch({ type: 'SET_LEVEL', selectData: e.target.value })}

                />
            </div>

            {state.isLoading ? <b>Loading...</b> : <button onClick={fetchRecommendations}>
                Get Recommendation
            </button>}
            <br />
            <br />
            {
                state.aiResponses.map((recommend, index) => {
                    return (
                        <details key={index} name="recommendation">
                            <summary>Recommendation {index + 1}</summary>
                            <p> {recommend?.content?.parts[0]?.text}</p>
                        </details>
                    )
                })
            }
        </div>
    </section>)
}