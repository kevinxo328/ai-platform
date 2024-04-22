from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.get("")
def get_prompts():
    try:
        return [
            {
                "name": "病例分析",
                "sys_prompt": """Please convert the data into json format, and include the following fields: 'gender' 'age' 'medical_history_summary' 'treatment_plan' 'lifestyle_guidance', evey field should be record in Eniglish.""",
                "tags": [],
            }
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
