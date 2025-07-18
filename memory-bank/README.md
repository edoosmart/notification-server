# Memory Bank - NestJS Notification Service 🧠📚

## Mục đích
Memory Bank lưu trữ **lịch sử context, conversations, và knowledge** của dự án để:
- Track evolution của project architecture
- Document decision making process
- Preserve institutional knowledge
- Enable knowledge transfer cho team members
- Support AI assistant với historical context

## 📁 Cấu trúc Memory Bank

```
memory-bank/
├── README.md                    # File này - hướng dẫn memory bank
├── conversations/               # Lịch sử conversations quan trọng
│   ├── 2024-01-15_architecture-design.md
│   ├── 2024-01-15_memory-bank-creation.md
│   └── template.md
├── decisions/                   # Architecture decisions & rationale
│   ├── 001-database-choice.md
│   ├── 002-redis-caching-strategy.md
│   ├── 003-notification-flow-design.md
│   └── template.md
├── knowledge-base/              # Accumulated knowledge
│   ├── patterns/
│   │   ├── nestjs-patterns.md
│   │   ├── redis-patterns.md
│   │   └── error-handling.md
│   ├── integrations/
│   │   ├── firebase-setup.md
│   │   └── external-auth.md
│   └── troubleshooting/
│       ├── common-issues.md
│       └── performance-tips.md
├── contexts/                    # Specific context snapshots
│   ├── project-state/
│   │   ├── 2024-01-15_initial-analysis.md
│   │   └── current-architecture.md
│   └── feature-contexts/
│       ├── notification-system.md
│       └── authentication-flow.md
└── evolution/                   # Project evolution tracking
    ├── changelog.md
    ├── milestones.md
    └── lessons-learned.md
```

## 🎯 Cách sử dụng Memory Bank

### 1. Conversations (Lịch sử Conversations)
**Mục đích**: Lưu các conversation quan trọng có insights value
**Khi nào**: Sau mỗi conversation có decisions hoặc significant discoveries
**Format**: `YYYY-MM-DD_topic-name.md`

### 2. Decisions (Architecture Decisions)
**Mục đích**: Document architectural decisions với rationale
**Khi nào**: Khi có major technical decisions
**Format**: ADR (Architecture Decision Record) format

### 3. Knowledge Base (Tích lũy Knowledge)
**Mục đích**: Accumulate reusable knowledge và patterns
**Update**: Continuous, khi discover new patterns hoặc solutions

### 4. Contexts (Context Snapshots)
**Mục đích**: Snapshot current state cho future reference
**Update**: Major milestones hoặc before significant changes

### 5. Evolution (Project Evolution)
**Mục đích**: Track how project evolves over time
**Update**: Regular intervals và major milestones

## 📝 Templates & Standards

### Conversation Template
```markdown
# Conversation: [Topic] - [Date]

## Context
- **Date**: YYYY-MM-DD
- **Participants**: AI Assistant + User
- **Topic**: Brief description

## Key Points
- Point 1
- Point 2

## Decisions Made
- Decision 1 with rationale
- Decision 2 with rationale

## Actions Taken
- [ ] Action 1
- [ ] Action 2

## Knowledge Gained
- New pattern discovered
- Solution for problem X

## References
- Related files: `path/to/file.ts`
- Related conversations: `memory-bank/conversations/other.md`
```

### Decision Template (ADR)
```markdown
# ADR-XXX: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing or have agreed to implement?

## Consequences
What becomes easier or more difficult to do and any risks introduced?

## Alternatives Considered
What other options were considered and why were they rejected?
```

## 🔄 Maintenance Workflow

### Daily
- [ ] Update ongoing conversations nếu có significant progress
- [ ] Note down any quick insights hoặc solutions

### Weekly  
- [ ] Review và consolidate knowledge from recent work
- [ ] Update troubleshooting guides nếu encounter new issues
- [ ] Archive completed conversations

### Monthly
- [ ] Review decision records cho consistency
- [ ] Update project evolution documentation
- [ ] Cleanup obsolete knowledge
- [ ] Identify knowledge gaps

### Quarterly
- [ ] Major knowledge base reorganization nếu cần
- [ ] Lessons learned compilation
- [ ] Archive old contexts that are no longer relevant

## 🚀 Integration với Development Workflow

### Before Major Changes
1. **Context Snapshot**: Document current state
2. **Decision Record**: If architectural change, create ADR
3. **Impact Analysis**: Reference previous decisions

### During Development
1. **Note Insights**: Document patterns và solutions as discovered
2. **Update Knowledge**: Add to relevant knowledge base sections
3. **Track Decisions**: Small decisions có thể note trong conversations

### After Completion
1. **Conversation Archive**: Document the full journey
2. **Lessons Learned**: What worked, what didn't
3. **Knowledge Update**: Consolidate learnings into knowledge base

## 🔍 Search & Discovery

### Finding Information
- **By Topic**: Check relevant folder first
- **By Date**: Use chronological order trong conversations/
- **By Pattern**: Search knowledge-base/patterns/
- **By Problem**: Check troubleshooting/

### Cross-References
- Use consistent linking between related documents
- Maintain index của key topics
- Tag documents với relevant keywords

## 🎖️ Best Practices

### 1. Write for Future Self
- Assume reader doesn't have current context
- Include enough background information
- Use clear, descriptive titles

### 2. Keep It Current
- Regular updates better than perfect documentation
- Archive outdated information
- Mark deprecated decisions clearly

### 3. Make It Searchable
- Use consistent terminology
- Include relevant keywords
- Cross-link related content

### 4. Quality over Quantity
- Focus on insights, not just facts
- Prioritize actionable knowledge
- Remove noise, keep signal

---
*Memory Bank initialized: 2024-01-15*
*Last updated: 2024-01-15* 