## Plan: Add Backend FastAPI Tests

**TL;DR** - Set up a `tests/` directory with pytest-based tests for the FastAPI app, covering all endpoints (GET activities, POST signup, DELETE participant removal, and root redirect). Use FastAPI's TestClient for isolated, in-memory testing to validate API behavior without external dependencies.

### Steps
0. **Update requirements.txt**  
   Add `pytest` to `requirements.txt` to ensure the testing framework is installed.

1. **Create tests directory and initial test file**  
   Create a new `tests/` folder in the project root. Inside it, add `test_app.py` with imports and a TestClient fixture. This sets up the testing foundation using pytest and FastAPI's built-in test client.

2. **Add test for GET /activities endpoint**  
   Write a test function that calls `client.get("/activities")`, asserts 200 status, and verifies the response contains expected activity keys (e.g., "Chess Club") and structure (description, schedule, etc.).

3. **Add test for POST /activities/{name}/signup endpoint**  
   Test successful signup: POST with a new email, assert 200 and success message. Test duplicate signup: POST the same email again, assert 400 with "already signed up" error. Test invalid activity: POST to non-existent activity, assert 404.

4. **Add test for DELETE /activities/{name}/participants/{email} endpoint**  
   Test successful removal: DELETE an existing participant, assert 200 and message. Test non-existent participant: DELETE unknown email, assert 404. Test invalid activity: DELETE from non-existent activity, assert 404.

5. **Add test for root redirect (GET /)**  
   Test that `client.get("/")` returns a 307 redirect to "/static/index.html".

6. **Run tests to validate**  
   Execute `pytest` from the project root to run all tests. Ensure they pass, confirming the API works as expected. If failures occur, debug and fix (e.g., check endpoint paths or response formats).

### Relevant files
- `tests/test_app.py` — New file containing all test functions (create this).
- `src/app.py` — Reference for endpoint logic and data structure (no changes needed).
- `requirements.txt` — Add pytest to this file.

### Verification
1. Run `pytest` in terminal; all tests should pass (5-6 test functions total).
2. Manually test API with curl or browser to confirm real behavior matches tests (e.g., `curl http://localhost:8000/activities`).
3. Check test coverage if desired (optional: install pytest-cov and run with `--cov=src`).

### Decisions
- **Testing framework**: Use pytest with FastAPI TestClient for simplicity and speed (no need for httpx in tests since TestClient handles it).
- **Test isolation**: Each test runs independently; in-memory data resets per test.
- **Scope**: Focus on API endpoints only; frontend tests can be added later if needed.
- **Directory**: `tests/` in root for standard Python project structure.

### Further Considerations
1. If you want to add more activities or mock data for tests, let me know—we can expand the test data.  
2. Should we include tests for edge cases like max participants or email validation? (Recommend yes for robustness.)  
3. Any specific test naming or structure preferences?  

Does this plan align with what you had in mind? Ready to proceed or adjust? 🚀
