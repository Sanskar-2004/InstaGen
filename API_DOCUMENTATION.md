# Logo Generation API Documentation

## Endpoint: POST /api/ai/generate-logo

### Purpose
Generate professional logos using Gemini-optimized prompts with Pollinations.ai rendering.

### Request Format
```json
{
  "brand_name": "YourBrandName",
  "style": "Modern"  // Optional, defaults to "Modern"
}
```

### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| brand_name | string | Yes | - | The name of the brand for the logo |
| style | string | No | Modern | Logo style (see Style Options below) |

### Style Options
```
Modern
Vintage
Minimalist
Luxury
Tech
Playful
Organic
Abstract
3D
Sports
```

### Response Format (Success - HTTP 200)
```json
{
  "status": "success",
  "url": "https://image.pollinations.ai/prompt/professional%20modern%20logo%20for%20YourBrand%2C%20vector%20art%2C%20...",
  "brand_name": "YourBrand",
  "style": "Modern",
  "seed": 123456789,
  "model": "gemini-2.0-flash",
  "message": "Generated using Gemini API + Pollinations.ai"
}
```

### Response Format (Success with Fallback - HTTP 200)
```json
{
  "status": "success",
  "url": "https://image.pollinations.ai/prompt/professional%20modern%20logo%20for%20YourBrand%2C%20...",
  "brand_name": "YourBrand",
  "style": "Modern",
  "seed": 987654321,
  "model": "gemini-fallback",
  "message": "Generated using Gemini Fallback + Pollinations.ai"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Either "success" or "error" |
| url | string | Direct image URL from Pollinations.ai (can be loaded in <img>) |
| brand_name | string | Echo of requested brand name |
| style | string | Echo of requested style |
| seed | number | Random seed used for reproducibility |
| model | string | "gemini-2.0-flash" (Gemini API used) or "gemini-fallback" (fallback prompt) |
| message | string | Human-readable description of generation method |

### Error Response (HTTP 500)
```json
{
  "detail": "Logo generation failed: [error details]"
}
```

## Frontend Integration Example

```javascript
// Request
const response = await axios.post('http://localhost:8000/api/ai/generate-logo', {
  brand_name: 'TechFlow',
  style: 'Modern'
});

// Response handling
if (response.data.status === 'success') {
  // Option 1: Use image URL directly
  const imageUrl = response.data.url;
  
  // Option 2: Proxy through /api/proxy-image for CORS handling
  const proxyResponse = await axios.post('http://localhost:8000/api/proxy-image', {
    url: imageUrl
  });
  
  // Display as data URL
  const dataUrl = proxyResponse.data.data;  // base64 encoded
  document.getElementById('logo').src = dataUrl;
  
  // Log which method was used
  console.log(`Generated with ${response.data.model}`);
}
```

## Proxy Endpoint: POST /api/proxy-image

### Purpose
Convert image URLs to base64 data URLs for cross-origin loading and canvas manipulation.

### Request Format
```json
{
  "url": "https://image.pollinations.ai/prompt/..."
}
```

### Response Format (Success)
```json
{
  "status": "success",
  "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

### Response Format (Failure)
```json
{
  "status": "error",
  "detail": "All image sources temporarily unavailable"
}
```

## Fallback Chain

The proxy endpoint will attempt image retrieval in this order:

1. **Gemini-Optimized Pollinations URL** → If successful, return image
2. **DiceBear Geometric Shapes** → If Pollinations fails, use geometric fallback
3. **Error** → If both fail, return error (rare)

## Best Practices

### For Frontend Teams
1. Always use the proxy endpoint (`/api/proxy-image`) for image loading
   - Ensures CORS handling
   - Provides automatic fallback
   - Converts to base64 for canvas manipulation

2. Check the `model` field in response
   - `"gemini-2.0-flash"` = Gemini API was used (optimal quality)
   - `"gemini-fallback"` = Gemini quota exceeded but still generated (good quality)

3. Display the seed value for reproducibility
   - Same brand_name + style + seed = same logo
   - Useful for showing "regenerated with same style"

### For Backend Teams
1. Monitor response time (target: <3 seconds)
2. Log the `model` field to track Gemini API vs fallback usage
3. If fallback usage >80%, may need to optimize fallback prompts
4. DiceBear fallback indicates Pollinations.ai was unreachable

## Performance Characteristics

| Scenario | Response Time | Quality |
|----------|---------------|---------|
| Gemini API available + quota | 2-3s | Excellent |
| Gemini quota exceeded (fallback) | 1-2s | Very Good |
| Image fetch from Pollinations | 1-2s | Excellent |
| DiceBear geometric fallback | <1s | Good |

## Error Handling

### 500 Error - Logo Generation Failed
- **Cause**: Gemini API unavailable and other issues
- **Solution**: Check backend logs for specific error
- **Fallback**: Retry request (should eventually succeed)

### 429 Error (from Gemini API)
- **Cause**: Gemini API quota exceeded
- **Handled By**: System automatically uses fallback prompt
- **Result**: Logo still generates (user sees no error)

### Network Timeout
- **Cause**: Service unavailable or network issue
- **Solution**: Implement retry logic with exponential backoff
- **Fallback**: DiceBear geometric shapes in proxy endpoint

## Testing the API

```bash
# Test logo generation
curl -X POST http://localhost:8000/api/ai/generate-logo \
  -H "Content-Type: application/json" \
  -d '{"brand_name":"TestBrand","style":"Modern"}'

# Test proxy with image URL
curl -X POST http://localhost:8000/api/proxy-image \
  -H "Content-Type: application/json" \
  -d '{"url":"https://image.pollinations.ai/prompt/test?width=512&height=512"}'
```

## Deployment Notes

### Requirements
- ✅ FastAPI backend running
- ✅ Uvicorn ASGI server
- ✅ Python 3.8+ with httpx, requests
- ✅ Optional: GEMINI_API_KEY for prompt optimization

### Configuration
Set in `.env`:
```bash
GEMINI_API_KEY=your_key_here  # Optional but recommended
```

### Monitoring
Check backend logs for:
```
✅ Using Gemini API to optimize prompt
   OR
📝 Using optimized fallback prompt (no API call)
```

---
**Version**: 1.0  
**Last Updated**: December 13, 2025  
**Status**: Production Ready
