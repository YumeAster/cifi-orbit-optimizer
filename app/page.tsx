"use client";

import { useEffect, useMemo, useState } from "react";
import { App as AntApp, Alert, Badge, Button, Card, ConfigProvider, Flex, Input, Layout, Progress, Space, Statistic, Tabs, Tag, Typography } from "antd";
import koKR from "antd/locale/ko_KR";
import { CheckCircleFilled, DatabaseOutlined, SaveOutlined, UndoOutlined, WarningFilled } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type FieldKind = "positive" | "integer" | "short" | "decimal" | "bar";
type FieldGroup = "weights" | "player" | "ship";
type FieldDefinition = { key: string; label: string; cell: string; kind: FieldKind; group: FieldGroup; recommended?: string; suffix?: string };

const weightFields: FieldDefinition[] = [
  { key: "cells", label: "Cells", cell: "D10", kind: "positive", group: "weights", recommended: "1" },
  { key: "modPoints", label: "Mod Points", cell: "D11", kind: "positive", group: "weights", recommended: "12" },
  { key: "shards", label: "Shards", cell: "D12", kind: "positive", group: "weights", recommended: "10" },
  { key: "research", label: "Research", cell: "D13", kind: "positive", group: "weights", recommended: "8" },
  { key: "academyPoints", label: "Academy Points", cell: "D14", kind: "positive", group: "weights", recommended: "24" },
  { key: "materials", label: "Materials", cell: "D15", kind: "positive", group: "weights", recommended: "72" },
  { key: "costReduction", label: "Cost Reduction", cell: "D16", kind: "positive", group: "weights", recommended: "6" },
  { key: "rankPoints", label: "Rank Points", cell: "D17", kind: "positive", group: "weights", recommended: "1" },
];

const playerFields: FieldDefinition[] = [
  { key: "level", label: "Level", cell: "H4", kind: "integer", group: "player" },
  { key: "loopsFilled", label: "Loops Filled", cell: "H5", kind: "integer", group: "player" },
  { key: "loopResets", label: "Loop Resets", cell: "H6", kind: "integer", group: "player" },
  { key: "operationsDone", label: "Operations Done", cell: "H7", kind: "short", group: "player" },
  { key: "studiesDone", label: "Studies Done", cell: "H8", kind: "short", group: "player" },
  ...Array.from({ length: 8 }, (_, index) => ({ key: `manualMk${index + 1}`, label: `Manual mk${index + 1}`, cell: `H${index + 9}`, kind: "short" as const, group: "player" as const })),
  { key: "softwareTech", label: "Software Tech", cell: "H17", kind: "short", group: "player" },
  { key: "lpDoublerBarFill", label: "LP Doubler Bar Fill", cell: "H18", kind: "bar", group: "player", suffix: "/ 10" },
  { key: "shardTickspeed", label: "Shard Tickspeed", cell: "H20", kind: "decimal", group: "player", suffix: "sec" },
  { key: "equipmentBought", label: "Equipment Bought", cell: "H21", kind: "integer", group: "player" },
  { key: "totalResearchLevels", label: "Total Research Levels", cell: "H22", kind: "integer", group: "player" },
  { key: "completedResearches", label: "Completed Researches", cell: "H23", kind: "integer", group: "player" },
];

const shipNames = ["Cradle", "Auxesia", "Zagreus", "Hephaestus", "Demeter", "Koios", "Zeus"];
const shipFields: FieldDefinition[] = shipNames.flatMap((ship, index) => [
  { key: `${ship.toLowerCase()}Rank`, label: `${ship} Rank`, cell: `L${4 + index * 2}`, kind: "integer", group: "ship" },
  { key: `${ship.toLowerCase()}Crew`, label: `${ship} Crew`, cell: `L${5 + index * 2}`, kind: "integer", group: "ship" },
]);

const allFields = [...weightFields, ...playerFields, ...shipFields];
const storageKey = "cifi-orbit.mtc-inputs.v1";

function createInitialValues() {
  return Object.fromEntries(allFields.map((field) => [field.key, field.recommended ?? ""])) as Record<string, string>;
}

function validateField(field: FieldDefinition, rawValue: string) {
  const value = rawValue.trim().replaceAll(",", "");
  if (!value) return "";
  if (field.kind === "short") {
    const shortNumber = /^(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+|k|m|b|t|qa|qu|sx|sp|o|n|d)?$/i;
    return shortNumber.test(value) ? "" : "숫자, 과학 표기 또는 1k·2.22b 같은 짧은 표기를 입력하세요.";
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "유효한 숫자를 입력하세요.";
  if (parsed < 0) return "0 이상의 값을 입력하세요.";
  if (field.kind === "positive" && parsed <= 0) return "가중치는 0보다 커야 합니다.";
  if ((field.kind === "integer" || field.kind === "bar") && !Number.isInteger(parsed)) return "정수를 입력하세요.";
  if (field.kind === "bar" && parsed > 10) return "0부터 10 사이의 값을 입력하세요.";
  return "";
}

function InputManager() {
  const { message } = AntApp.useApp();
  const initialValues = useMemo(() => createInitialValues(), []);
  const [draft, setDraft] = useState<Record<string, string>>(initialValues);
  const [saved, setSaved] = useState<Record<string, string>>(initialValues);
  const [activeTab, setActiveTab] = useState<FieldGroup>("weights");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as { values?: Record<string, unknown>; updatedAt?: string };
        const restored = { ...initialValues };
        for (const field of allFields) {
          const value = parsed.values?.[field.key];
          if (typeof value === "string") restored[field.key] = value;
        }
        queueMicrotask(() => {
          setDraft(restored);
          setSaved(restored);
          setUpdatedAt(parsed.updatedAt ?? null);
        });
      }
    } catch {
      message.warning("저장된 입력값을 읽지 못해 기본값으로 시작합니다.");
    } finally {
      queueMicrotask(() => setReady(true));
    }
  }, [initialValues, message]);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    for (const field of allFields) {
      const error = validateField(field, draft[field.key] ?? "");
      if (error) next[field.key] = error;
    }
    const total = Number(draft.totalResearchLevels);
    const completed = Number(draft.completedResearches);
    if (draft.totalResearchLevels && draft.completedResearches && completed > total) next.completedResearches = "완료 연구 수는 전체 연구 레벨보다 클 수 없습니다.";
    return next;
  }, [draft]);

  const changedKeys = useMemo(() => allFields.filter((field) => (draft[field.key] ?? "") !== (saved[field.key] ?? "")).map((field) => field.key), [draft, saved]);
  const filledCount = allFields.filter((field) => (draft[field.key] ?? "").trim()).length;
  const completion = Math.round((filledCount / allFields.length) * 100);
  const updateValue = (key: string, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  const saveValues = () => {
    if (Object.keys(errors).length) return void message.error("오류가 있는 입력값을 먼저 확인해 주세요.");
    const timestamp = new Date().toISOString();
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, updatedAt: timestamp, values: draft }));
      setSaved({ ...draft });
      setUpdatedAt(timestamp);
      message.success("입력값을 이 브라우저에 저장했습니다.");
    } catch {
      message.error("브라우저 저장소에 입력값을 저장하지 못했습니다.");
    }
  };
  const restoreSaved = () => { setDraft({ ...saved }); message.info("마지막 저장 상태로 되돌렸습니다."); };
  const applyRecommendedWeights = () => {
    setDraft((current) => ({ ...current, ...Object.fromEntries(weightFields.map((field) => [field.key, field.recommended ?? ""])) }));
    message.success("시트의 권장 가중치를 입력했습니다. 저장 버튼을 눌러 확정하세요.");
  };

  const fieldPanel = (fields: FieldDefinition[], group: FieldGroup) => (
    <div className={`field-panel field-panel-${group}`}>
      <div className="field-panel-heading">
        <div>
          <Text className="section-kicker">MODVALUES · {group === "weights" ? "D10:D17" : group === "player" ? "H4:H23" : "L4:L17"}</Text>
          <Title level={3}>{group === "weights" ? "Weights" : group === "player" ? "Player Progress" : "Ship Progress"}</Title>
          <Paragraph>{group === "weights" ? "추천 점수에서 각 자원의 중요도를 조절합니다. 시트 권장값은 1 / 12 / 10 / 8 / 24 / 72 / 6 / 1입니다." : group === "player" ? "시트 안내와 동일하게 각 통계의 현재 최고 Long Run 기록을 입력하면 갱신 횟수를 줄일 수 있습니다." : "각 함선의 현재 Rank와 Crew를 입력합니다."}</Paragraph>
        </div>
        {group === "weights" && <Button onClick={applyRecommendedWeights}>권장 가중치 적용</Button>}
      </div>
      <div className="field-grid">
        {fields.map((field) => {
          const error = errors[field.key];
          return (
            <label className={`field-row ${error ? "has-error" : ""}`} key={field.key}>
              <span className="field-label"><span>{field.label}</span><code>{field.cell}</code></span>
              <Input aria-label={field.label} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder={field.kind === "short" ? "예: 1k, 2.22b, 4.33e12" : "값 입력"} inputMode={field.kind === "short" ? "text" : field.kind === "integer" || field.kind === "bar" ? "numeric" : "decimal"} suffix={field.suffix} />
              <span className="field-message">{error || (field.recommended ? `권장 ${field.recommended}` : field.kind === "short" ? "짧은 단위 표기 지원" : "\u00a0")}</span>
            </label>
          );
        })}
      </div>
      {group === "player" && <Alert className="formula-alert" type="info" showIcon title="Mods Achv Cur/Next는 입력값이 아닙니다" description="원본 시트의 H19:I19는 수식으로 계산되는 값이므로 입력 관리에서 제외했습니다. 계산 엔진 단계에서 구현합니다." />}
    </div>
  );

  const tabItems = [
    { key: "weights", label: <span className="tab-label"><span className="tab-dot tab-dot-weights" />Weights <Badge count={weightFields.length} /></span>, children: fieldPanel(weightFields, "weights") },
    { key: "player", label: <span className="tab-label"><span className="tab-dot tab-dot-player" />Player Progress <Badge count={playerFields.length} /></span>, children: fieldPanel(playerFields, "player") },
    { key: "ship", label: <span className="tab-label"><span className="tab-dot tab-dot-ship" />Ship Progress <Badge count={shipFields.length} /></span>, children: fieldPanel(shipFields, "ship") },
  ];

  return (
    <Layout className="input-app-shell">
      <Header className="input-header">
        <div className="brand-lockup"><div className="brand-cell"><DatabaseOutlined /></div><div><div className="brand-title">CIFI ORBIT</div><div className="brand-caption">MOD TREE CULTIVATOR</div></div></div>
        <Space size={10} wrap>
          <Tag color={changedKeys.length ? "gold" : "green"} icon={changedKeys.length ? <WarningFilled /> : <CheckCircleFilled />}>{changedKeys.length ? `${changedKeys.length}개 변경됨` : "저장 상태와 일치"}</Tag>
          <Button icon={<UndoOutlined />} disabled={!changedKeys.length} onClick={restoreSaved}>되돌리기</Button>
          <Button type="primary" icon={<SaveOutlined />} disabled={!ready || !changedKeys.length || Boolean(Object.keys(errors).length)} onClick={saveValues}>저장</Button>
        </Space>
      </Header>
      <Content className="input-content">
        <main className="input-container">
          <section className="page-intro"><Space size={8} className="breadcrumb"><span>CIFI ORBIT</span><span>/</span><span>MOD TREE</span><span>/</span><strong>INPUTS</strong></Space><Title>입력값 관리</Title><Paragraph>기존 프로토타입 기능을 비우고, 원본 <strong>ModValues</strong> 시트의 입력 흐름부터 다시 구현했습니다.</Paragraph></section>
          <Alert className="scope-alert" type="warning" showIcon title="현재 구현 범위: 입력·검증·로컬 저장" description="추천 계산, Mod 목록, 구매 기능은 아직 연결하지 않았습니다. 입력값은 서버나 Google Sheets로 전송되지 않고 이 브라우저에만 저장됩니다." />
          <section className="status-grid" aria-label="입력 상태">
            <Card><Statistic title="전체 입력 항목" value={allFields.length} suffix="개" /><Text type="secondary">가중치 8 · 플레이어 19 · 함선 14</Text></Card>
            <Card><Statistic title="입력 완료" value={filledCount} suffix={`/ ${allFields.length}`} /><Progress percent={completion} showInfo={false} strokeColor="#20b94b" /></Card>
            <Card><Statistic title="검증 오류" value={Object.keys(errors).length} styles={{ content: { color: Object.keys(errors).length ? "#cf1322" : "#31903c" } }} /><Text type="secondary">빈 항목은 아직 오류로 처리하지 않습니다.</Text></Card>
            <Card><Statistic title="마지막 저장" value={updatedAt ? new Date(updatedAt).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }) : "없음"} /><Text type="secondary">브라우저 로컬 저장소</Text></Card>
          </section>
          <Card className="sheet-card" title={<Flex align="center" gap={10}><span className="sheet-icon">M</span><div><div>ModValues</div><small>v1.2.0.11 입력 구조 기준</small></div></Flex>}>
            <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as FieldGroup)} items={tabItems} destroyOnHidden={false} />
          </Card>
        </main>
      </Content>
      <div className="save-dock" aria-label="입력값 저장"><div><strong>{changedKeys.length ? `${changedKeys.length}개 변경사항` : "모든 변경사항 저장됨"}</strong><span>{Object.keys(errors).length ? ` · 오류 ${Object.keys(errors).length}개` : " · 입력값은 이 기기에만 보관됩니다"}</span></div><Space><Button disabled={!changedKeys.length} onClick={restoreSaved}>되돌리기</Button><Button type="primary" icon={<SaveOutlined />} disabled={!ready || !changedKeys.length || Boolean(Object.keys(errors).length)} onClick={saveValues}>입력값 저장</Button></Space></div>
    </Layout>
  );
}

export default function Home() {
  return <ConfigProvider locale={koKR} theme={{ token: { colorPrimary: "#187940", colorInfo: "#18a5b4", colorSuccess: "#20b94b", colorWarning: "#d6a800", colorError: "#d62d28", colorText: "#17251d", colorTextSecondary: "#68756d", colorBgLayout: "#f4f6f3", borderRadius: 10, fontFamily: "var(--font-geist-sans), Pretendard, sans-serif" }, components: { Button: { primaryShadow: "0 6px 18px rgba(24,121,64,.2)" }, Card: { headerBg: "#ffffff" }, Input: { activeBorderColor: "#6f7f2d", hoverBorderColor: "#909d43" }, Tabs: { itemSelectedColor: "#17251d", inkBarColor: "#187940" } } }}><AntApp><InputManager /></AntApp></ConfigProvider>;
}
