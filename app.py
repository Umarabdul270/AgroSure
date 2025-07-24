import RiskAnalizer
import requests


# placing the Curacel API base URL and endpoints.

CURACEL_API_BASE_URL = "https://api.playbox.grow.curacel.co/api"
CURACEL_RISK_ASSESSMENT_ENDPOINT = f"{CURACEL_API_BASE_URL}/v1/claims"
CURACEL_API_KEY = "CURACEL API goes here" # Placeholder
#Access points end.

def build_curacel_payload(claim_type, location, date, weather_data, description, farmer_profile):
    """Builds the payload for the Curacel API risk assessment request."""
    # This structure is a placeholder.
    # The actual structure should match the Curacel API documentation.
    return {
        "claim_type": claim_type,
        "location": location,
        "date": date,
        "weather_data": weather_data,
        "description": description,
        "farmer_profile": farmer_profile
    }

def chatbot_response(claim_type, location, date, weather_data, description, farmer_profile):
    print("Building Curacel API payload...")
    payload = build_curacel_payload(claim_type, location, date, weather_data, description, farmer_profile)
    print("Payload built:", json.dumps(payload, indent=2))

    headers = {
        "Content-Type": "application/json",

        "Authorization": f"Bearer {CURACEL_API_KEY}" # Example: Using Bearer token
    }
    print("Headers built.")
#collecting response and Error handling
    curacel_api_response_data = None
    curacel_error = None

    try:
        print(f"Calling Curacel API at {CURACEL_RISK_ASSESSMENT_ENDPOINT}...")
        response = requests.post(CURACEL_RISK_ASSESSMENT_ENDPOINT, json=payload, headers=headers)
        #response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        print("Curacel API call successful.")

        try:
            curacel_api_response_data = response.json()
            print("Raw Curacel API output:", curacel_api_response_data)

            # Assume the API returns a structure like {"risk_score": 90, "risk_reason": "..."}
            score = curacel_api_response_data.get("risk_score", "N/A")
            reason = curacel_api_response_data.get("risk_reason", "No reason provided by API")

            print(f"Extracted Score: {score}, Reason: {reason}")

            # Prepare Curacel data for potential use in GenAI prompt
            curacel_context = f"Curacel Risk Score: {score}, Reason: {reason}"

        except json.JSONDecodeError as e:
            curacel_error = f"Error decoding JSON from Curacel API response: {e}"
            print(curacel_error)
            print(f"Raw response text: {response.text}")
            traceback.print_exc()
            curacel_context = f"Curacel API response error: {curacel_error}"
        except Exception as e:
            curacel_error = f"An error occurred while processing Curacel API JSON: {e}"
            print(curacel_error)
            traceback.print_exc()
            curacel_context = f"Curacel API response error: {curacel_error}"


    except requests.exceptions.RequestException as e:
        curacel_error = f"An error occurred during Curacel API call: {e}"
        print(curacel_error)
        traceback.print_exc()
        curacel_context = f"Curacel API call failed: {curacel_error}"
    except Exception as e:
        curacel_error = f"An unexpected error occurred during Curacel API interaction: {e}"
        print(curacel_error)
        traceback.print_exc()
        curacel_context = f"Curacel API interaction failed: {curacel_error}"


    # --- GenAI Model Call (Existing Logic) ---
    # Now, incorporate the Curacel context into the GenAI prompt
    print("Building GenAI prompt with Curacel context...")

    genai_prompt_text = f"""
You are AgroSure AI, an expert agricultural insurance claims investigator. Your task is to evaluate each incoming claim and assign a fraud risk score between 0 and 100, where 0 means no fraud risk and 100 means very high risk
- Claim type: {claim_type}
- Location: {location}
- Date: {date}
- Weather on date: {weather_data}
- Farmer profile: {farmer_profile}
- Description: {description}
- Curacel API Assessment: {curacel_context}

Output format:
{{
  "score": 85,
  "reason": "No rain recorded despite flood claim, consistent with Curacel assessment."
}}
"""
    print("GenAI Prompt built:", genai_prompt_text)

    genai_output_text = "Error getting AI response" # Default error message
    try:
        print("Calling OpenAI API...")
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You analyze agricultural insurance claims for fraud risk, considering external risk assessments."},
                {"role": "user", "content": genai_prompt_text}
            ],
            temperature=0.3
        )
        print("OpenAI API call successful.")

        genai_output_text = response.choices[0].message.content
        print("Raw AI output:", genai_output_text)

        # Remove markdown formatting before parsing JSON
        json_output = genai_output_text.strip().replace("```json\n", "").replace("```", "")
        print("Cleaned AI output for JSON parsing:", json_output)

        try:
            dict_data = json.loads(json_output)
            print("JSON parsed successfully:", dict_data)
            # Decide how to combine or present the scores/reasons
            genai_score = dict_data.get('score', 'N/A')
            genai_reason = dict_data.get('reason', 'N/A')

            if curacel_error:
                 return f"Curacel API Error: {curacel_error}\nGenAI Assessment:\nFraud Score: {genai_score}\nReason: {genai_reason}"
            else:
                return f"Curacel API Assessment:\n{curacel_context}\n\nGenAI Assessment:\nFraud Score: {genai_score}\nReason: {genai_reason}"

        except json.JSONDecodeError as e:
            print(f"GenAI JSON Decode Error: {e}")
            print(f"Invalid JSON string from GenAI: {json_output}")
            traceback.print_exc()
            return f"Error processing GenAI response: JSON Decode Error. Details: {e}\nRaw GenAI Output: {genai_output_text}\nCuracel API Assessment:\n{curacel_context if not curacel_error else curacel_error}"

    except Exception as e:
        print(f"An error occurred during OpenAI API call: {e}")
        traceback.print_exc()
        return f"Error during GenAI risk assessment: {e}\nCuracel API Assessment:\n{curacel_context if not curacel_error else curacel_error}"
