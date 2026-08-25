"use client";

import { useEffect, useMemo, useState } from "react";
import { App as AntApp, Badge, Button, Card, ConfigProvider, Flex, Input, Layout, Select, Space, Tabs, Tag, Typography } from "antd";
import koKR from "antd/locale/ko_KR";
import { CheckCircleFilled, DatabaseOutlined, SaveOutlined, UndoOutlined, WarningFilled } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type FieldKind = "positive" | "integer" | "short" | "decimal" | "bar";
type FieldGroup = "weights" | "player" | "ship";
type FieldDefinition = { key: string; label: string; kind: FieldKind; group: FieldGroup; recommended?: string; suffix?: string };
type WeightPreset = { id: string; name: string; values: Record<string, string>; updatedAt: string };

const weightFields: FieldDefinition[] = [
  { key: "cells", label: "Cells", kind: "positive", group: "weights", recommended: "1" },
  { key: "modPoints", label: "Mod Points", kind: "positive", group: "weights", recommended: "12" },
  { key: "shards", label: "Shards", kind: "positive", group: "weights", recommended: "10" },
  { key: "research", label: "Research", kind: "positive", group: "weights", recommended: "8" },
  { key: "academyPoints", label: "Academy Points", kind: "positive", group: "weights", recommended: "24" },
  { key: "materials", label: "Materials", kind: "positive", group: "weights", recommended: "72" },
  { key: "costReduction", label: "Cost Reduction", kind: "positive", group: "weights", recommended: "6" },
  { key: "rankPoints", label: "Rank Points", kind: "positive", group: "weights", recommended: "1" },
];

const playerFields: FieldDefinition[] = [
  { key: "level", label: "Level", kind: "integer", group: "player" },
  { key: "loopsFilled", label: "Loops Filled", kind: "integer", group: "player" },
  { key: "loopResets", label: "Loop Resets", kind: "integer", group: "player" },
  { key: "operationsDone", label: "Operations Done", kind: "short", group: "player" },
  { key: "studiesDone", label: "Studies Done", kind: "short", group: "player" },
  ...Array.from({ length: 8 }, (_, index) => ({ key: `manualMk${index + 1}`, label: `Manual mk${index + 1}`, kind: "short" as const, group: "player" as const })),
  { key: "softwareTech", label: "Software Tech", kind: "short", group: "player" },
  { key: "lpDoublerBarFill", label: "LP Doubler Bar Fill", kind: "bar", group: "player", suffix: "/ 10" },
  { key: "shardTickspeed", label: "Shard Tickspeed", kind: "decimal", group: "player", suffix: "sec" },
  { key: "equipmentBought", label: "Equipment Bought", kind: "integer", group: "player" },
  { key: "totalResearchLevels", label: "Total Research Levels", kind: "integer", group: "player" },
  { key: "completedResearches", label: "Completed Researches", kind: "integer", group: "player" },
];

const shipNames = ["Cradle", "Auxesia", "Zagreus", "Hephaestus", "Demeter", "Koios", "Zeus"];
const shipFields: FieldDefinition[] = shipNames.flatMap((ship) => [
  { key: `${ship.toLowerCase()}Rank`, label: `${ship} Rank`, kind: "integer", group: "ship" },
  { key: `${ship.toLowerCase()}Crew`, label: `${ship} Crew`, kind: "integer", group: "ship" },
]);

const allFields = [...weightFields, ...playerFields, ...shipFields];
const inputStorageKey = "cifi-orbit.mtc-inputs.v1";
const presetStorageKey = "cifi-orbit.mtc-weight-presets.v1";
const defaultPresetId = "__recommended__";

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
  const [ready, setReady] = useState(false);
  const [weightPresets, setWeightPresets] = useState<WeightPreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState(defaultPresetId);

  useEffect(() => {
    const restored = { ...initialValues };
    let presets: WeightPreset[] = [];

    try {
      const storedInputs = window.localStorage.getItem(inputStorageKey);
      if (storedInputs) {
        const parsed = JSON.parse(storedInputs) as { values?: Record<string, unknown> };
        for (const field of allFields) {
          const value = parsed.values?.[field.key];
          if (typeof value === "string") restored[field.key] = value;
        }
      }
      const storedPresets = window.localStorage.getItem(presetStorageKey);
      if (storedPresets) {
        const parsed = JSON.parse(storedPresets) as unknown;
        if (Array.isArray(parsed)) {
          presets = parsed.filter((item): item is WeightPreset => Boolean(
            item
            && typeof item === "object"
            && typeof (item as WeightPreset).id === "string"
            && typeof (item as WeightPreset).name === "string"
            && typeof (item as WeightPreset).values === "object",
          ));
        }
      }
    } catch {
      message.warning("저장된 설정을 읽지 못해 기본값으로 시작합니다.");
    }

    queueMicrotask(() => {
      setDraft(restored);
      setSaved(restored);
      setWeightPresets(presets);
      setReady(true);
    });
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
  const updateValue = (key: string, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const recommendedWeights = useMemo(() => Object.fromEntries(weightFields.map((field) => [field.key, field.recommended ?? ""])), []);
  const presetOptions = [
    { value: defaultPresetId, label: "기본 권장값" },
    ...weightPresets.map((preset) => ({ value: preset.id, label: preset.name })),
  ];

  const saveValues = () => {
    if (Object.keys(errors).length) return void message.error("오류가 있는 입력값을 먼저 확인해 주세요.");
    try {
      window.localStorage.setItem(inputStorageKey, JSON.stringify({ version: 1, values: draft }));
      setSaved({ ...draft });
      message.success("입력값을 이 기기에 저장했습니다.");
    } catch {
      message.error("입력값을 저장하지 못했습니다.");
    }
  };

  const restoreSaved = () => { setDraft({ ...saved }); message.info("마지막 저장 상태로 되돌렸습니다."); };

  const loadSelectedPreset = () => {
    const presetValues = selectedPresetId === defaultPresetId
      ? recommendedWeights
      : weightPresets.find((preset) => preset.id === selectedPresetId)?.values;
    if (!presetValues) return void message.error("불러올 프리셋을 찾지 못했습니다.");
    setDraft((current) => ({ ...current, ...Object.fromEntries(weightFields.map((field) => [field.key, presetValues[field.key] ?? field.recommended ?? ""])) }));
    message.success("Weight 프리셋을 불러왔습니다. 저장 버튼을 눌러 입력값에 반영하세요.");
  };

  const saveWeightPreset = () => {
    const name = presetName.trim();
    if (!name) return void message.error("프리셋 이름을 입력해 주세요.");
    if (weightPresets.some((preset) => preset.name === name)) return void message.error("같은 이름의 프리셋이 이미 있습니다.");
    const preset: WeightPreset = {
      id: `weight-${Date.now()}`,
      name,
      values: Object.fromEntries(weightFields.map((field) => [field.key, draft[field.key] ?? ""])),
      updatedAt: new Date().toISOString(),
    };
    const next = [...weightPresets, preset];
    try {
      window.localStorage.setItem(presetStorageKey, JSON.stringify(next));
      setWeightPresets(next);
      setSelectedPresetId(preset.id);
      setPresetName("");
      message.success(`“${name}” 프리셋을 저장했습니다.`);
    } catch {
      message.error("프리셋을 저장하지 못했습니다.");
    }
  };

  const fieldPanel = (fields: FieldDefinition[], group: FieldGroup) => (
    <div className={`field-panel field-panel-${group}`}>
      <div className="field-panel-heading">
        <div>
          <Text className="section-kicker">{group === "weights" ? "PRIORITY SETTINGS" : group === "player" ? "PLAYER PROFILE" : "SHIP PROFILE"}</Text>
          <Title level={3}>{group === "weights" ? "Weights" : group === "player" ? "Player Progress" : "Ship Progress"}</Title>
          <Paragraph>{group === "weights" ? "각 자원의 중요도를 조절합니다. 기본 권장값을 불러오거나 현재 값을 이름 있는 프리셋으로 저장할 수 있습니다." : group === "player" ? "각 통계의 현재 최고 Long Run 기록을 입력하세요." : "각 함선의 현재 Rank와 Crew를 입력하세요."}</Paragraph>
        </div>
      </div>

      {group === "weights" && (
        <section className="preset-panel" aria-label="Weight 프리셋">
          <div className="preset-copy"><strong>Weight 프리셋</strong><span>프리셋은 이 브라우저에만 저장됩니다.</span></div>
          <div className="preset-actions">
            <Input aria-label="새 Weight 프리셋 이름" value={presetName} maxLength={32} placeholder="새 프리셋 이름" onChange={(event) => setPresetName(event.target.value)} onPressEnter={saveWeightPreset} />
            <Button onClick={saveWeightPreset}>현재 Weight 저장</Button>
          </div>
          <div className="preset-actions">
            <Select aria-label="저장된 Weight 프리셋" value={selectedPresetId} options={presetOptions} onChange={setSelectedPresetId} />
            <Button type="primary" onClick={loadSelectedPreset}>불러오기</Button>
          </div>
        </section>
      )}

      <div className="field-list">
        {fields.map((field) => {
          const error = errors[field.key];
          return (
            <label className={`field-row ${error ? "has-error" : ""}`} key={field.key}>
              <span className="field-label"><strong>{field.label}</strong><small>{field.recommended ? `기본값 ${field.recommended}` : field.kind === "short" ? "짧은 단위 표기 지원" : ""}</small></span>
              <Input aria-label={field.label} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder={field.kind === "short" ? "예: 1k, 2.22b, 4.33e12" : "값 입력"} inputMode={field.kind === "short" ? "text" : field.kind === "integer" || field.kind === "bar" ? "numeric" : "decimal"} suffix={field.suffix} />
              <span className="field-message">{error || " "}</span>
            </label>
          );
        })}
      </div>
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
          <section className="page-intro"><Space size={8} className="breadcrumb"><span>CIFI ORBIT</span><span>/</span><span>MOD TREE</span><span>/</span><strong>INPUTS</strong></Space><Title>입력값 관리</Title></section>
          <Card className="input-card" title={<Flex align="center" gap={10}><span className="input-icon">M</span><div><div>Mod Tree Profile</div><small>저장된 설정은 이 기기에만 보관됩니다.</small></div></Flex>}>
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
