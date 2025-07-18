# Ignore Files Strategy - NestJS Project

## Overview
Documentation về strategy cho .gitignore và .dockerignore trong NestJS Notification Service project.

## Git Ignore Strategy

### Philosophy
- **Include essential project files** trong version control
- **Exclude sensitive information** (credentials, keys)
- **Exclude build artifacts** và temporary files
- **Keep memory-bank structure** nhưng có option exclude content

### Cursor IDE Exclusions
```gitignore
# Cursor IDE specific files
.cursor/
.cursor-server/
.cursor-tutor/
```

**Rationale**: 
- Cursor IDE files are environment-specific
- Contains user-specific settings và preferences
- Should not be shared across team members
- Can contain temporary data và caches

### Memory Bank Strategy
```gitignore
# Memory Bank (development knowledge)
# Comment out these lines if you want to include memory-bank in version control
# memory-bank/conversations/
# memory-bank/contexts/project-state/
# memory-bank/evolution/

# Keep memory-bank structure and templates in version control by default
# Only exclude specific sensitive or temporary content if needed
```

**Decision**: **Include memory-bank in Git by default**

**Rationale**:
- ✅ **Team Knowledge Sharing**: Memory-bank contains valuable team knowledge
- ✅ **Onboarding**: New team members benefit from historical context
- ✅ **Decision History**: Architecture decisions should be tracked
- ✅ **Templates**: Templates và structure valuable for team

**Optional Exclusion Cases**:
- If memory-bank contains sensitive project information
- If conversations contain confidential client data
- If team prefers external knowledge management system

### Firebase Security
```gitignore
# Firebase
/config/firebase-key.json
*firebase*.json
```

**Critical**: Firebase credentials must NEVER be committed
- Contains private keys và service account credentials
- Security vulnerability if exposed
- Should be provided via environment variables hoặc secure deployment

## Docker Ignore Strategy

### Philosophy
- **Minimize Docker context size** cho faster builds
- **Exclude development-only files** from container
- **Security**: Don't include sensitive development files
- **Performance**: Smaller context = faster builds

### Memory Bank & Documentation Exclusion
```dockerignore
# Memory Bank (not needed in Docker container)
memory-bank/
docs/
```

**Rationale**:
- **Production Container**: Memory-bank không cần trong production
- **Size Optimization**: Documentation files add unnecessary size
- **Security**: Avoid including development knowledge trong production images
- **Clean Separation**: Keep development knowledge separate from runtime

### Development Tools Exclusion
```dockerignore
# Development tools
.eslintrc*
.prettierrc*
.gitignore
.dockerignore

# Test and coverage files
test/
coverage/
.nyc_output/
jest.config.*
```

**Rationale**:
- **Production Focus**: Runtime container doesn't need development tools
- **Size Optimization**: Reduce image size significantly
- **Security**: Fewer files = smaller attack surface
- **Performance**: Faster image builds và deployments

### Cursor IDE Exclusion
```dockerignore
# Cursor IDE specific files
.cursor/
.cursor-server/
.cursor-tutor/
```

**Rationale**:
- **Environment Specific**: IDE files not relevant trong container
- **Size**: Can contain large cache files
- **Security**: May contain local paths và sensitive info
- **Cleanliness**: Keep container focused on application code

## Best Practices

### Git Ignore
1. **Review Regularly**: Update as project evolves
2. **Team Agreement**: Discuss memory-bank inclusion với team
3. **Environment Files**: Never commit real .env files
4. **Sensitive Data**: Always exclude credentials và keys

### Docker Ignore
1. **Minimal Context**: Include only necessary files for build
2. **Security First**: Exclude development secrets và configs
3. **Performance**: Monitor build times và optimize accordingly
4. **Layer Caching**: Structure ignores to maximize Docker layer caching

### Memory Bank Specific
1. **Sensitive Content**: If memory-bank contains sensitive info, exclude specific folders
2. **External Systems**: Consider using external knowledge base for sensitive projects
3. **Cleanup**: Regularly review và archive old contexts
4. **Access Control**: If included in Git, ensure repository access controls appropriate

## Implementation Notes

### Current Setup
- **Git**: Memory-bank included by default với comments cho optional exclusion
- **Docker**: Memory-bank excluded cho production builds
- **Cursor**: Excluded from both Git và Docker
- **Firebase**: Securely excluded with multiple patterns

### Future Considerations
- **CI/CD**: Ensure build pipelines handle ignored files correctly
- **Deployment**: Production environment should not depend on ignored files
- **Team Workflow**: Train team on proper usage của ignore files
- **Security Audit**: Regular review của ignored files cho compliance

## Maintenance

### Regular Tasks
- **Monthly**: Review ignore patterns for new file types
- **Per Feature**: Update ignores when adding new tools hoặc dependencies  
- **Security Review**: Quarterly audit cho sensitive data patterns
- **Team Sync**: Ensure all team members understand ignore strategy

### Monitoring
- **Build Times**: Watch Docker build performance
- **Repository Size**: Monitor Git repository growth
- **Security Scans**: Ensure no sensitive data leaked through ignores
- **Team Feedback**: Collect input on ignore effectiveness

---
*Strategy documented: 2024-01-15*
*Next review: 2024-04-15* 