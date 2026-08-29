# Ultimate CIFI Optimizer Agent Guide

Last updated: 2026-08-29
Type: system
Source: project connector
Instruction version: 1.1.3.0
Update trigger: 프로젝트 부팅, 작업 경계, AsterOS 연결 또는 프로젝트 Memory 경로가 바뀔 때
Read when: 이 프로젝트의 모든 새 세션에서

## Purpose

CIFI와 MTC 계산·최적화 로직을 로컬 도구로 옮기고, 원본 수식과 표시 UI를 검증 가능하게 관리한다.

## Boot Order

1. `AGENTS.md`
2. `ASTEROS.md`에서 AsterOS 지침 버전과 부팅 순서를 확인한다.
3. `D:\Tool Dev\Ultimate CIFI Optimizer\Memory\MemoryIndex.md`
4. `D:\Tool Dev\Ultimate CIFI Optimizer\Memory\policy\PolicyIndex.md`
5. `README.md`
6. `package.json`
7. `현재 작업 파일`

## Common Rules

- 기본 대화와 프로젝트 문서 언어는 한국어다.
- 기존 사용자 작업을 보존하고, 삭제·초기화·대규모 이동 전에는 대상과 복구 방법을 확인한다.
- 현재 상태, 확정된 선택, 이유, 실패한 접근, 보류 이유와 열린 질문은 프로젝트 컨테이너의 Memory 경로에서 관리한다.
- 원문 대화 전체와 일회성 잡담을 장기기억에 복사하지 않는다.
- 사용자가 저장하지 말라고 한 내용은 저장하지 않는다. 비밀번호, 인증 토큰, 복구 코드와 결제 정보도 기억 파일에 저장하지 않는다.
- 기본 담당 메이트는 시아다. 사용자가 다른 메이트를 직접 부르면 현재 대화를 우선하고, 역할·호칭·말투는 AsterOS 메이트 문서를 따른다.

## Project Boundary

- 프로젝트 메인 폴더 `D:\Tool Dev\Ultimate CIFI Optimizer`에는 코드, 실행 자산, 코드에 가까운 문서와 필수 연결 문서만 둔다.
- 장기기억과 운영 정책은 프로젝트 Memory 경로 `D:\Tool Dev\Ultimate CIFI Optimizer\Memory`에만 둔다.
- 메인 폴더 안에 `memory/`, `policy/` 또는 같은 역할의 호환 포인터를 만들지 않는다.
- 세부 작업·검증·배포·입력 정책은 프로젝트 Memory의 `policy/PolicyIndex.md`에서 찾아 적용한다.

## Memory And Session End

- 기억을 찾거나 저장할 때 프로젝트 Memory 경로 `D:\Tool Dev\Ultimate CIFI Optimizer\Memory\MemoryIndex.md`부터 읽는다.
- 프로젝트의 구현·검증·배포·상태가 바뀌는 요청은 `D:\AsterOS\Main\system\ProjectMemoryCapturePolicy.md`에 따라 프로젝트 Memory를 먼저 갱신·검증한다.
- 운영 정책은 `D:\Tool Dev\Ultimate CIFI Optimizer\Memory\policy\PolicyIndex.md`에서 찾는다.
- 프로젝트 메인 폴더와 기억·정책 폴더의 물리적 분리는 `policy/repository-boundaries.md`를 따른다.
- 민감한 원문은 원격 추적되지 않는 로컬 전용 위치에만 두며, 외부 업로드 전에 제외 여부를 확인한다.
- 매 사용자 공개 대화의 시작과 최종 응답 직전에 `D:\AsterOS\Main\state\debug_settings.md`와 `D:\AsterOS\Main\system\DebugReportingPolicy.md`를 읽는다. 설정이 `ON`인 지침·기억 디버깅은 변경 여부와 관계없이 모든 최종 응답에 반드시 표시한다.
- 세션 제목을 바꿀 수 있으면 `CIFI Optimizer - 도구 개발` 형식을 사용한다.
<!-- ASTEROS-CONTAINER-START -->
## Project Container

- 프로젝트 컨테이너: D:\Tool Dev\Ultimate CIFI Optimizer
- 프로젝트 파일 루트: D:\Tool Dev\Ultimate CIFI Optimizer\Main
- 프로젝트 기억 루트: D:\Tool Dev\Ultimate CIFI Optimizer\Memory
- 코드, 자산, 산출물과 일반 문서는 Main/에 둔다.
- 장기기억, 기억 정책과 인덱스는 Memory/에 둔다.
- 새 세션은 Main/AGENTS.md, Main/ASTEROS.md, Memory/MemoryIndex.md, Memory/policy/PolicyIndex.md를 먼저 확인한다.
- 별도 지시가 없는 프로젝트 상대 경로는 Main/을 기준으로 해석한다.
<!-- ASTEROS-CONTAINER-END -->
