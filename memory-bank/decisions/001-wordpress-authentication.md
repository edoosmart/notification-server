# ADR-001: WordPress Authentication Integration

## Status
**Accepted**

*Date*: 2024-01-15  
*Deciders*: Development Team  
*Technical Story*: Integration with WordPress server for user authentication

## Context
The notification service requires user authentication to secure API endpoints and ensure only authorized users can send notifications và access user-specific data.

### Background
- Current authentication system is generic with external API calls
- Need to integrate with existing WordPress infrastructure
- WordPress manages user accounts, roles, và permissions
- Notification service should leverage WordPress user management

### Requirements
- **Secure Authentication**: Validate user tokens against WordPress
- **User Data Integration**: Access WordPress user information (roles, capabilities)
- **Performance**: Fast token validation without blocking operations
- **Reliability**: Handle WordPress server unavailability gracefully
- **Compatibility**: Support different WordPress authentication plugins

### Constraints
- WordPress server is external dependency
- Network latency between services
- WordPress API rate limiting considerations
- JWT token format varies by WordPress plugin

## Decision
Integrate with WordPress server for authentication using JWT token validation through WordPress REST API endpoints.

### Chosen Solution
- **Primary Endpoint**: `/wp-json/jwt-auth/v1/token/validate` (JWT Authentication plugin)
- **Fallback Support**: WordPress REST API `/wp-json/wp/v2/users/me`
- **Data Normalization**: Transform WordPress user data to application format
- **Error Handling**: Graceful fallback với proper error logging
- **Security**: No token logging, HTTPS communication

### Implementation Details
```typescript
// AuthService enhanced to call WordPress API
async verifyAccessToken(accessToken: string): Promise<any> {
  const wordpressUrl = this.configService.get<string>('WORDPRESS_AUTH_URL');
  const response = await this.httpService.post(wordpressUrl, {}, {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 10000
  });
  return this.normalizeWordPressUser(response.data);
}
```

## Consequences

### Positive Consequences
- **Centralized User Management**: Single source of truth trong WordPress
- **Role-based Access**: Leverage WordPress roles và capabilities
- **Scalable Authentication**: WordPress handles user scale
- **Flexible Integration**: Support multiple WordPress authentication methods
- **Security**: Proven WordPress authentication mechanisms

### Negative Consequences
- **External Dependency**: WordPress server becomes critical dependency
- **Network Latency**: Additional HTTP call for each authentication
- **Complexity**: Need to handle WordPress API variations
- **Single Point of Failure**: WordPress downtime affects authentication
- **Data Synchronization**: User data changes trong WordPress need handling

### Neutral Consequences
- **WordPress Plugin Dependency**: Requires JWT Authentication plugin installation
- **Token Format**: Must handle different JWT implementations
- **API Versioning**: WordPress API changes may require updates

## Alternatives Considered

### Alternative 1: Direct Database Access
- **Description**: Connect directly to WordPress database
- **Pros**: Faster access, no HTTP overhead, full data access
- **Cons**: Tight coupling, security risks, no API abstraction
- **Why rejected**: Violates separation of concerns, security risks

### Alternative 2: Custom Authentication Service
- **Description**: Build separate authentication microservice
- **Pros**: Full control, optimized for our use case, independent
- **Cons**: Duplicates WordPress user management, maintenance overhead
- **Why rejected**: Creates duplicate user management systems

### Alternative 3: WordPress as Proxy
- **Description**: Route all requests through WordPress
- **Pros**: WordPress handles all auth logic, simple integration
- **Cons**: WordPress becomes bottleneck, tight coupling
- **Why rejected**: Performance concerns, architectural complexity

### Alternative 4: Status Quo (Generic External Auth)
- **Description**: Keep current generic external authentication
- **Pros**: No changes needed, technology agnostic
- **Cons**: Doesn't leverage WordPress infrastructure, duplicate systems
- **Why rejected**: Misses opportunity for WordPress integration

## Implementation Plan

### Phase 1: Core Integration (Immediate)
- [x] Update AuthService to call WordPress API
- [x] Implement WordPress user data normalization
- [x] Add error handling và logging
- [x] Update environment configuration
- [x] Document WordPress integration

### Phase 2: Reliability (Short-term)
- [ ] Add retry logic với exponential backoff
- [ ] Implement health checks for WordPress connectivity
- [ ] Add comprehensive error monitoring
- [ ] Performance optimization (caching valid tokens)

### Phase 3: Advanced Features (Long-term)
- [ ] Role-based authorization in notification sending
- [ ] WordPress user role integration trong notification targeting
- [ ] Real-time WordPress user data synchronization
- [ ] WordPress webhook integration for user changes

## Validation Criteria

### Success Metrics
- **Authentication Success Rate**: >99% for valid tokens
- **Response Time**: <2 seconds for token validation
- **Error Handling**: Graceful handling of WordPress downtime
- **Security**: No token leakage trong logs or errors

### Monitoring Plan
- **Response Times**: Monitor WordPress API call latency
- **Error Rates**: Track authentication failures by type
- **WordPress Health**: Monitor WordPress server availability
- **User Experience**: Track authentication-related user complaints

## Dependencies

### Internal Dependencies
- **HttpModule**: For WordPress API communication
- **ConfigService**: For WordPress URL configuration
- **Logger Service**: For debugging và monitoring

### External Dependencies
- **WordPress Server**: Must be accessible và healthy
- **JWT Authentication Plugin**: Required for primary endpoint
- **Network Connectivity**: Reliable connection to WordPress
- **HTTPS**: Secure communication requirements

## Risks & Mitigation

### Technical Risks
- **Risk**: WordPress server unavailability
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Implement retry logic, health checks, fallback mechanisms

### Security Risks
- **Risk**: Token interception or logging
- **Probability**: Low
- **Impact**: High
- **Mitigation**: HTTPS only, no token logging, secure error handling

### Performance Risks
- **Risk**: WordPress API latency affecting user experience
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Timeout configuration, response time monitoring, caching

### Integration Risks
- **Risk**: WordPress plugin compatibility issues
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Support multiple authentication endpoints, fallback options

## Related Decisions

### Influences
- **Future ADR**: Role-based notification targeting
- **Future ADR**: WordPress user data synchronization
- **Future ADR**: Caching strategy for authentication

### Relates to
- **Firebase Integration**: Both are external service integrations
- **Redis Caching**: Could cache WordPress authentication results

## References

### Documentation
- [WordPress REST API Documentation](https://developer.wordpress.org/rest-api/)
- [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module)

### Research
- WordPress JWT plugin comparison và compatibility
- Authentication performance benchmarks
- Security analysis of WordPress REST API

### Implementation Files
- `src/auth/auth.service.ts` - Main authentication logic
- `src/auth/auth.guard.ts` - Route protection
- `docs/integrations/wordpress-auth.md` - Integration documentation

## Notes

### Discussion Summary
- Team agreed WordPress integration provides better user management
- Security concerns addressed with proper error handling
- Performance acceptable with timeout configuration
- Monitoring strategy essential for production reliability

### Assumptions Made
- WordPress server will be reliable và properly maintained
- JWT Authentication plugin will be installed và configured
- Network connectivity between services will be stable
- WordPress API structure will remain relatively stable

### Open Questions
- **Caching Strategy**: Should we cache valid tokens to reduce WordPress load?
- **Failover**: What happens if WordPress is down for extended periods?
- **Rate Limiting**: How to handle WordPress API rate limits?
- **User Sync**: How to handle WordPress user data changes in real-time?

---
*ADR Status: Accepted*  
*Created: 2024-01-15*  
*Last Updated: 2024-01-15*  
*Next Review: 2024-04-15* 