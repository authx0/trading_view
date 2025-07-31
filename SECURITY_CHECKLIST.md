# 🔒 Security Checklist

## Before Pushing to GitHub

### ✅ Environment Variables
- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] Environment variables are properly configured
- [ ] API keys are only loaded from environment variables

### ✅ Sensitive Data
- [ ] No API keys in documentation files
- [ ] No passwords or secrets in code
- [ ] No database credentials in source code
- [ ] No private keys or certificates

### ✅ Build Artifacts
- [ ] `dist/` folder is in `.gitignore`
- [ ] `build/` folder is in `.gitignore`
- [ ] No compiled files committed
- [ ] No node_modules committed

### ✅ Logging & Debugging
- [ ] No sensitive data in console logs
- [ ] Debug logging only in development mode
- [ ] No API key previews in production logs
- [ ] Error messages don't expose sensitive information

### ✅ Dependencies
- [ ] All dependencies are up to date
- [ ] No known security vulnerabilities
- [ ] Using `pnpm audit` to check for issues
- [ ] Lock file is committed

## Security Best Practices

### API Key Management
```bash
# Always use environment variables
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here

# Never commit .env files
echo ".env" >> .gitignore
```

### Development vs Production
```typescript
// Only log sensitive info in development
if ((import.meta as any).env?.DEV) {
  console.log('API key length:', apiKey.length);
}
```

### Error Handling
```typescript
// Don't expose internal details
catch (error) {
  console.error('API Error:', error.message);
  // Don't log full error objects with sensitive data
}
```

## Regular Security Checks

1. **Weekly**: Run `pnpm audit` to check for vulnerabilities
2. **Before each push**: Review git diff for sensitive data
3. **Monthly**: Review and update dependencies
4. **Quarterly**: Review API key permissions and rotate if needed

## Emergency Response

If you accidentally commit sensitive data:

1. **Immediately**: Revoke the exposed API key
2. **Create new key**: Generate a new API key
3. **Update .env**: Replace with new key
4. **Force push**: Remove sensitive data from git history
5. **Monitor**: Check for any unauthorized usage

## Contact

For security issues, please create a private issue or contact the development team directly. 