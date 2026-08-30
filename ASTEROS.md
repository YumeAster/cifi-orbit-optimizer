# Ultimate CIFI Optimizer AsterOS Reference

Last updated: 2026-08-30
Type: system
Source: project
Instruction version: 1.1.3.1
Update trigger: AsterOS 부팅, 프로젝트 컨테이너, 문서 버전, 메이트 또는 기억 연결이 바뀔 때
Read when: 프로젝트 세션을 시작하거나 AsterOS에 상태를 반영할 때

## Project Identity

- 프로젝트 컨테이너: D:\Tool Dev\Ultimate CIFI Optimizer
- 프로젝트 파일 루트: D:\Tool Dev\Ultimate CIFI Optimizer\Main
- 프로젝트 기억 루트: D:\Tool Dev\Ultimate CIFI Optimizer\Memory
- 프로젝트 기억 인덱스: D:\Tool Dev\Ultimate CIFI Optimizer\Memory\MemoryIndex.md
- 프로젝트 정책 인덱스: D:\Tool Dev\Ultimate CIFI Optimizer\Memory\policy\PolicyIndex.md
- AsterOS 루트: D:\AsterOS
- 도메인 요약: D:\AsterOS\Main\domains\infra\overview.md
- 기본 메이트: 시아
- 메이트 정의: D:\AsterOS\Main\identity\mates\sia.md
- 메이트 기억: D:\AsterOS\Memory\sia\MemoryIndex.md

## Session Start

1. D:\AsterOS\Main\AGENTS.md
2. D:\AsterOS\Main\system\SessionInitialization.md
3. 이 프로젝트의 Main\AGENTS.md와 Main\ASTEROS.md
4. 이 프로젝트의 Memory\MemoryIndex.md와 Memory\policy\PolicyIndex.md
5. D:\AsterOS\Main\state\debug_settings.md와 D:\AsterOS\Main\system\DebugReportingPolicy.md를 읽는다.
6. 프로젝트 상태·검증·배포 요청이면 D:\AsterOS\Main\system\ProjectMemoryCapturePolicy.md를 읽고 프로젝트 Memory를 갱신·검증한다.
7. D:\AsterOS\Main\system\InstructionVersionPolicy.md에 따라 아래 표를 비교한다.
8. 값이 없거나 다르면 프로젝트 지침과 표를 먼저 갱신하고 확인한 뒤 원래 작업을 수행한다.
9. 요청에 필요한 AsterOS 공통 기억, 선택된 메이트 기억과 현재 상태만 추가로 읽는다.

## AsterOS Instruction Versions

| 문서 | 검수 버전 | 확인일 | 적용 메모 |
| --- | --- | --- | --- |
| D:\AsterOS\Main\AGENTS.md | 1.4.5.0 | 2026-08-29 | 프로젝트별 기억 선행 갱신 규칙과 매 대화 디버깅 적용 |
| D:\AsterOS\Main\system\SessionInitialization.md | 1.4.4.0 | 2026-08-29 | 프로젝트 기억 처리와 세션 초기화 순서 적용 |
| D:\AsterOS\Main\system\paths.md | 1.0.0.0 | 2026-08-30 | AsterOS 루트 탐색과 경로 표기 규칙 적용 |
| D:\AsterOS\Main\system\boot.md | 1.0.1.1 | 2026-08-30 | 세션 초반 프로젝트·기억 탐색 순서 적용 |
| D:\AsterOS\Main\system\routing.md | 1.1.2.0 | 2026-08-30 | 기술 업무의 시아 라우팅과 관련 문서 최소 탐색 적용 |
| D:\AsterOS\Main\system\DevelopmentDecisionFlow.md | 1.0.0.0 | 2026-08-30 | 사용자가 요청한 개발 전략 비교안을 제시하고 선택 전 구현하지 않는 절차 적용 |
| D:\AsterOS\Main\system\InstructionVersionPolicy.md | 1.3.2.1 | 2026-08-29 | 실제 프로젝트 루트 기반 초기화와 지연 검수 적용 |
| D:\AsterOS\Main\system\MemoryPolicy.md | 1.3.3.0 | 2026-08-29 | 내용형 기억의 고정 형식, 단일 제목과 세부 주제 계층 검증 적용 |
| D:\AsterOS\Main\system\ConversationCapturePolicy.md | 1.0.3.0 | 2026-08-29 | 임시 원문·기억 추출·검증·삭제와 매 응답 기억 디버깅 적용 |
| D:\AsterOS\Main\system\DebugReportingPolicy.md | 1.0.1.0 | 2026-08-29 | 매 대화 필수 ON/OFF 디버깅 출력 적용 |
| D:\AsterOS\Main\system\ProjectMemoryCapturePolicy.md | 1.0.0.0 | 2026-08-29 | 프로젝트 상태·검증·배포 전후 프로젝트 Memory 갱신 적용 |
| D:\AsterOS\Main\identity\mate_router.md | 1.1.0.1 | 2026-08-29 | 현재 역할·직접 호출·공유 기억과 민감 경로 적용 |
| D:\AsterOS\Main\docs\project_asteros_reference.md | 1.4.4.0 | 2026-08-29 | 프로젝트 구조와 매 대화 디버깅 적용 |

## Memory And Privacy

- 프로젝트 작업은 Main/, 장기기억과 기억 정책은 Memory/에 저장한다.
- 기억을 찾거나 저장하기 전에 Memory/MemoryIndex.md와 필요한 하위 인덱스를 읽는다.
- 매 사용자 공개 대화의 기억 처리는 AsterOS ConversationCapturePolicy.md를 따른다.
- 지침·기억 디버깅이 ON이면, 매 최종 응답에 변경 여부와 관계없이 `DebugReportingPolicy.md`가 정한 상태와 표 또는 변경 없음을 출력한다.
- 사용자가 저장하지 말라고 한 내용, 비밀번호, 인증 토큰, 복구 코드와 결제 정보는 저장하지 않는다.
- 민감한 원문과 개인 맥락은 로컬 전용 경로에만 두고 Git, 웹, 클라우드와 외부 서비스에 올리지 않는다.

## Scope

이 연결은 D:\Tool Dev\Ultimate CIFI Optimizer 프로젝트 컨테이너에만 적용한다. 관리자가 별도 경로를 프로젝트로 지정하지 않으면 상위·인접 폴더나 외부 코드베이스를 초기화하거나 수정하지 않는다.
