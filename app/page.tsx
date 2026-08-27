"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { App as AntApp, Badge, Button, Card, ConfigProvider, Divider, Flex, Input, Layout, Menu, Popconfirm, Space, Tabs, Tag, Typography } from "antd";
import koKR from "antd/locale/ko_KR";
import { AppstoreOutlined, CheckCircleFilled, DatabaseOutlined, DeleteOutlined, FolderOpenOutlined, SaveOutlined, SettingOutlined, TeamOutlined, TrophyOutlined, UndoOutlined, WarningFilled } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type FieldKind = "positive" | "integer" | "short" | "decimal" | "bar";
type FieldGroup = "weights" | "player" | "ship";
type FieldDefinition = { key: string; label: string; kind: FieldKind; group: FieldGroup; recommended?: string; suffix?: string };
type WeightPreset = { id: string; name: string; values: Record<string, string>; updatedAt: string };
type FieldSection = { title: string; description: string; keys: string[] };
type ResourcePalette = { accent: string; ink: string; surface: string; border: string; glow: string };
type PlayerResourceSection = FieldSection & { key: string; palette: ResourcePalette; wide?: boolean };

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
const shipPalette: Record<string, ResourcePalette> = {
  Cradle: { accent: "#16aee9", ink: "#087caf", surface: "#effaff", border: "#8fd9f2", glow: "rgba(22, 174, 233, .16)" },
  Auxesia: { accent: "#ff9a31", ink: "#c76c16", surface: "#fff7e9", border: "#ffca7a", glow: "rgba(255, 154, 49, .17)" },
  Zagreus: { accent: "#ed4949", ink: "#bb3030", surface: "#fff1f1", border: "#f2a0a0", glow: "rgba(237, 73, 73, .16)" },
  Hephaestus: { accent: "#a8ca3d", ink: "#6f8e15", surface: "#f7fbe9", border: "#c9e47f", glow: "rgba(168, 202, 61, .18)" },
  Demeter: { accent: "#35bdd8", ink: "#0a829a", surface: "#effcff", border: "#8cdeeb", glow: "rgba(53, 189, 216, .16)" },
  Koios: { accent: "#b5a158", ink: "#796919", surface: "#fbf8e9", border: "#d9cf99", glow: "rgba(181, 161, 88, .17)" },
  Zeus: { accent: "#6f78ed", ink: "#4d56bd", surface: "#f1f2ff", border: "#aeb4f5", glow: "rgba(111, 120, 237, .16)" },
};
const playerPalette: Record<"level" | "generator" | "loop" | "shards" | "research" | "academy", ResourcePalette> = {
  level: { accent: "#9a70e8", ink: "#6d43bd", surface: "#f7f2ff", border: "#d9c6f5", glow: "rgba(154, 112, 232, .16)" },
  generator: shipPalette.Cradle,
  loop: shipPalette.Zagreus,
  shards: shipPalette.Demeter,
  research: shipPalette.Koios,
  academy: shipPalette.Zeus,
};
const playerResourceSections: PlayerResourceSection[] = [
  { key: "level", title: "레벨", description: "Level과 LP 진행 상태입니다.", keys: ["level", "lpDoublerBarFill"], palette: playerPalette.level },
  { key: "generator", title: "Generator", description: "Manual mk와 Software Tech 진행도입니다.", keys: [...Array.from({ length: 8 }, (_, index) => `manualMk${index + 1}`), "softwareTech"], palette: playerPalette.generator, wide: true },
  { key: "loop", title: "Loop", description: "Loop 및 MP 진행 상태입니다.", keys: ["loopsFilled", "loopResets"], palette: playerPalette.loop },
  { key: "shards", title: "Shards", description: "Operation과 Shard 진행도입니다.", keys: ["operationsDone", "shardTickspeed"], palette: playerPalette.shards },
  { key: "research", title: "Research", description: "Equipment 및 연구 진행도입니다.", keys: ["equipmentBought", "totalResearchLevels", "completedResearches"], palette: playerPalette.research },
  { key: "academy", title: "아카데미", description: "Academy Study 완료 기록입니다.", keys: ["studiesDone"], palette: playerPalette.academy },
];
const shipFields: FieldDefinition[] = shipNames.flatMap((ship) => [
  { key: `${ship.toLowerCase()}Rank`, label: `${ship} Rank`, kind: "integer", group: "ship" },
  { key: `${ship.toLowerCase()}Crew`, label: `${ship} Crew`, kind: "integer", group: "ship" },
]);

const fieldSections: Record<FieldGroup, FieldSection[]> = {
  weights: [
    { title: "자원 우선순위", description: "기본 자원 획득의 중요도를 설정합니다.", keys: ["cells", "modPoints", "shards", "research"] },
    { title: "성장 보상", description: "성장 과정에서 얻는 보상 자원의 중요도입니다.", keys: ["academyPoints", "materials"] },
    { title: "효율 보정", description: "비용 절감과 Rank 보상에 대한 우선순위입니다.", keys: ["costReduction", "rankPoints"] },
  ],
  player: playerResourceSections,
  ship: shipNames.map((ship) => ({
    title: ship,
    description: "Rank와 Crew를 함께 관리합니다.",
    keys: [`${ship.toLowerCase()}Rank`, `${ship.toLowerCase()}Crew`],
  })),
};
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
    return /^(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+|k|m|b|t|qa|qu|sx|sp|o|n|d)?$/i.test(value) ? "" : "숫자, 과학 표기 또는 1k·2.22b 같은 짧은 표기를 입력하세요.";
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "유효한 숫자를 입력하세요.";
  if (parsed < 0) return "0 이상의 값을 입력하세요.";
  if (field.kind === "positive" && parsed <= 0) return "가중치는 0보다 커야 합니다.";
  if ((field.kind === "integer" || field.kind === "bar") && !Number.isInteger(parsed)) return "정수를 입력하세요.";
  if (field.kind === "bar" && parsed > 10) return "0부터 10 사이의 값을 입력하세요.";
  return "";
}

function groupLabel(group: FieldGroup) {
  return group === "weights" ? "Weights" : group === "player" ? "Player Progress" : "Ship Progress";
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
      if (storedPresets && Array.isArray(JSON.parse(storedPresets))) {
        presets = (JSON.parse(storedPresets) as unknown[]).filter((item): item is WeightPreset => Boolean(item && typeof item === "object" && typeof (item as WeightPreset).id === "string" && typeof (item as WeightPreset).name === "string" && typeof (item as WeightPreset).values === "object"));
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
    if (draft.totalResearchLevels && draft.completedResearches && Number(draft.completedResearches) > Number(draft.totalResearchLevels)) next.completedResearches = "완료 연구 수는 전체 연구 레벨보다 클 수 없습니다.";
    return next;
  }, [draft]);
  const changedKeys = useMemo(() => allFields.filter((field) => (draft[field.key] ?? "") !== (saved[field.key] ?? "")).map((field) => field.key), [draft, saved]);
  const recommendedWeights = useMemo(() => Object.fromEntries(weightFields.map((field) => [field.key, field.recommended ?? ""])), []);
  const selectedPreset = selectedPresetId === defaultPresetId ? undefined : weightPresets.find((preset) => preset.id === selectedPresetId);
  const updateValue = (key: string, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  const saveValues = () => {
    if (Object.keys(errors).length) return void message.error("오류가 있는 입력값을 먼저 확인해 주세요.");
    try {
      window.localStorage.setItem(inputStorageKey, JSON.stringify({ version: 1, values: draft }));
      setSaved({ ...draft });
      message.success("입력값을 이 기기에 저장했습니다.");
    } catch { message.error("입력값을 저장하지 못했습니다."); }
  };
  const restoreSaved = () => { setDraft({ ...saved }); message.info("마지막 저장 상태로 되돌렸습니다."); };
  const applyPreset = (presetId = selectedPresetId) => {
    const presetValues = presetId === defaultPresetId ? recommendedWeights : weightPresets.find((preset) => preset.id === presetId)?.values;
    if (!presetValues) return void message.error("불러올 프리셋을 찾지 못했습니다.");
    setSelectedPresetId(presetId);
    setActiveTab("weights");
    setDraft((current) => ({ ...current, ...Object.fromEntries(weightFields.map((field) => [field.key, presetValues[field.key] ?? field.recommended ?? ""])) }));
    message.success("Weight 프리셋을 불러왔습니다. 저장 버튼을 눌러 입력값에 반영하세요.");
  };
  const saveWeightPreset = () => {
    const name = presetName.trim();
    if (!name) return void message.error("프리셋 이름을 입력해 주세요.");
    if (weightPresets.some((preset) => preset.name === name)) return void message.error("같은 이름의 프리셋이 이미 있습니다.");
    const preset: WeightPreset = { id: `weight-${Date.now()}`, name, values: Object.fromEntries(weightFields.map((field) => [field.key, draft[field.key] ?? ""])), updatedAt: new Date().toISOString() };
    const next = [...weightPresets, preset];
    try {
      window.localStorage.setItem(presetStorageKey, JSON.stringify(next));
      setWeightPresets(next); setSelectedPresetId(preset.id); setPresetName("");
      message.success(`“${name}” 프리셋을 저장했습니다.`);
    } catch { message.error("프리셋을 저장하지 못했습니다."); }
  };
  const deleteSelectedPreset = () => {
    if (!selectedPreset) return;
    const next = weightPresets.filter((preset) => preset.id !== selectedPreset.id);
    try {
      window.localStorage.setItem(presetStorageKey, JSON.stringify(next));
      setWeightPresets(next); setSelectedPresetId(defaultPresetId);
      message.success(`“${selectedPreset.name}” 프리셋을 삭제했습니다.`);
    } catch { message.error("프리셋을 삭제하지 못했습니다."); }
  };

  const fieldsByGroup: Record<FieldGroup, FieldDefinition[]> = { weights: weightFields, player: playerFields, ship: shipFields };
  const renderField = (field: FieldDefinition) => {
    const error = errors[field.key];
    return <label className={`field-row ${error ? "has-error" : ""}`} key={field.key}>
      <span className="field-label"><strong>{field.label}</strong><small>{field.recommended ? `권장값 ${field.recommended}` : ""}</small></span>
      <Input aria-label={field.label} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder={field.kind === "short" ? "예: 1k, 2.22b, 4.33e12" : "값 입력"} inputMode={field.kind === "short" ? "text" : field.kind === "integer" || field.kind === "bar" ? "numeric" : "decimal"} suffix={field.suffix} />
      <span className="field-message">{error || " "}</span>
    </label>;
  };
  const resourceCardStyle = (palette: ResourcePalette) => ({
    "--resource-accent": palette.accent,
    "--resource-ink": palette.ink,
    "--resource-surface": palette.surface,
    "--resource-border": palette.border,
    "--resource-glow": palette.glow,
  }) as CSSProperties;
  const renderPlayerField = (field: FieldDefinition) => {
    const error = errors[field.key];
    return <label className={`player-field ${error ? "has-error" : ""}`} key={field.key}>
      <span>{field.label}</span>
      <Input aria-label={field.label} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder="값 입력" inputMode={field.kind === "short" ? "text" : field.kind === "integer" || field.kind === "bar" ? "numeric" : "decimal"} suffix={field.suffix} />
      {error && <small>{error}</small>}
    </label>;
  };
  const fieldPanel = (fields: FieldDefinition[], group: FieldGroup) => (
    <div className={`field-panel field-panel-${group}`}>
      <div className="field-panel-heading">
        <div className={`panel-symbol panel-symbol-${group}`}>{group === "weights" ? "W" : group === "player" ? "P" : "S"}</div>
        <div><Text className="section-kicker">{group === "weights" ? "PRIORITY SETTINGS" : group === "player" ? "PLAYER PROFILE" : "SHIP PROFILE"}</Text><Title level={3}>{groupLabel(group)}</Title><Paragraph>{group === "weights" ? "각 자원의 우선순위를 설정합니다. 프리셋 적용 후 입력값 저장을 누르면 현재 프로필에 반영됩니다." : group === "player" ? "각 통계의 현재 최고 Long Run 기록을 입력하세요." : "각 함선의 현재 Rank와 Crew를 입력하세요."}</Paragraph></div>
      </div>
      {group === "ship" ? <div className="ship-card-grid">
        {shipNames.map((ship) => {
          const shipGroup = fields.filter((field) => field.key === `${ship.toLowerCase()}Rank` || field.key === `${ship.toLowerCase()}Crew`);
          const palette = shipPalette[ship];
          const isRank = (field: FieldDefinition) => field.label.endsWith("Rank");
          const cardStyle = {
            "--ship-accent": palette.accent,
            "--ship-ink": palette.ink,
            "--ship-surface": palette.surface,
            "--ship-border": palette.border,
            "--ship-glow": palette.glow,
          } as CSSProperties;
          return <section className="ship-input-card" style={cardStyle} key={ship}>
            <div className="ship-card-heading"><span className="ship-card-dot" /><div><h4>{ship}</h4><p>Rank &amp; Crew</p></div></div>
            <div className="ship-field-stack">
              {shipGroup.map((field) => {
                const error = errors[field.key];
                return <label className={`ship-field ${error ? "has-error" : ""}`} key={field.key}>
                  <span className="ship-field-label">{isRank(field) ? <TrophyOutlined aria-hidden /> : <TeamOutlined aria-hidden />}{isRank(field) ? "Rank" : "Crew"}</span>
                  <Input aria-label={field.label} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder="값 입력" inputMode="numeric" />
                  {error && <small>{error}</small>}
                </label>;
              })}
            </div>
          </section>;
        })}
      </div> : group === "player" ? <div className="player-card-grid">
        {playerResourceSections.map((section) => {
          const sectionFields = fields.filter((field) => section.keys.includes(field.key));
          return <section className={`player-input-card ${section.wide ? "is-wide" : ""}`} style={resourceCardStyle(section.palette)} key={section.key}>
            <div className="player-card-heading"><span className="player-card-dot" /><div><h4>{section.title}</h4><p>{section.description}</p></div><Badge count={sectionFields.length} /></div>
            <div className={`player-field-grid ${section.wide ? "generator-grid" : ""}`}>{sectionFields.map(renderPlayerField)}</div>
          </section>;
        })}
      </div> : <div className="field-sections">
        {fieldSections[group].map((section) => {
          const sectionFields = fields.filter((field) => section.keys.includes(field.key));
          return <section className="field-section" key={section.title}>
            <div className="field-section-heading"><div><h4>{section.title}</h4><p>{section.description}</p></div><Badge count={sectionFields.length} /></div>
            <div className="field-list">{sectionFields.map(renderField)}</div>
          </section>;
        })}
      </div>}
    </div>
  );
  const tabItems = (["weights", "player", "ship"] as FieldGroup[]).map((group) => ({
    key: group, label: <span className="tab-label"><span className={`tab-dot tab-dot-${group}`} />{groupLabel(group)} <Badge count={fieldsByGroup[group].length} /></span>, children: fieldPanel(fieldsByGroup[group], group),
  }));

  return <Layout className="dashboard-shell">
    <Sider className="dashboard-sider" width={238} trigger={null}>
      <div className="sidebar-brand"><div className="brand-cell"><DatabaseOutlined /></div><div><strong>CIFI ORBIT</strong><span>MOD TREE CULTIVATOR</span></div></div>
      <div className="sidebar-caption">WORKSPACE</div>
      <Menu className="sidebar-menu" theme="dark" mode="inline" selectedKeys={[activeTab]} onClick={({ key }) => setActiveTab(key as FieldGroup)} items={[
        { key: "weights", icon: <AppstoreOutlined />, label: "입력값 관리" },
        { key: "player", icon: <FolderOpenOutlined />, label: "Player Progress" },
        { key: "ship", icon: <SettingOutlined />, label: "Ship Progress" },
      ]} />
      <div className="sidebar-foot"><div className="sidebar-foot-chip"><span className="sidebar-foot-dot" />로컬 프로필</div><p>현재 기기에만 저장됩니다.</p></div>
    </Sider>
    <Layout className="dashboard-main">
      <Header className="dashboard-header"><div><Text className="header-eyebrow">MOD TREE / {groupLabel(activeTab).toUpperCase()}</Text><Title level={4}>입력값 관리</Title></div><Space size={10} wrap><Tag color={changedKeys.length ? "gold" : "green"} icon={changedKeys.length ? <WarningFilled /> : <CheckCircleFilled />}>{changedKeys.length ? `${changedKeys.length}개 변경됨` : "저장됨"}</Tag><Button icon={<UndoOutlined />} disabled={!changedKeys.length} onClick={restoreSaved}>되돌리기</Button><Button type="primary" icon={<SaveOutlined />} disabled={!ready || !changedKeys.length || Boolean(Object.keys(errors).length)} onClick={saveValues}>입력값 저장</Button></Space></Header>
      <Content className="dashboard-content"><main className="workspace-grid">
        <section className="input-workspace"><div className="workspace-intro"><div><Text className="section-kicker">CURRENT PROFILE</Text><Title>Mod Tree Profile</Title><Paragraph>자원 우선순위와 진행도 기록을 한 화면에서 관리합니다.</Paragraph></div><div className={`group-chip group-chip-${activeTab}`}><span />{groupLabel(activeTab)}</div></div><Card className="input-card" variant="borderless"><Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as FieldGroup)} items={tabItems} destroyOnHidden={false} /></Card></section>
        <aside className="preset-sidebar" aria-label="Weight 프리셋 관리"><Card className="preset-card" title={<div><Text className="section-kicker">WEIGHT LIBRARY</Text><div className="preset-card-title">Weight 프리셋</div></div>} extra={<Badge count={weightPresets.length} showZero color="#708458" />}>
          <Paragraph className="preset-help">Weight 8개 항목만 저장합니다. 다른 입력값에는 영향을 주지 않습니다.</Paragraph>
          <div className="preset-create"><Input aria-label="새 Weight 프리셋 이름" value={presetName} maxLength={32} placeholder="새 프리셋 이름" onChange={(event) => setPresetName(event.target.value)} onPressEnter={saveWeightPreset} /><Button type="primary" onClick={saveWeightPreset}>저장</Button></div>
          <Divider />
          <div className="preset-list" role="list" aria-label="저장된 Weight 프리셋">
            <button className={`preset-item ${selectedPresetId === defaultPresetId ? "selected" : ""}`} type="button" onClick={() => setSelectedPresetId(defaultPresetId)}><span className="preset-item-mark default" /><span><strong>기본 권장값</strong><small>권장 Weight 세트</small></span></button>
            {weightPresets.map((preset) => <button className={`preset-item ${selectedPresetId === preset.id ? "selected" : ""}`} type="button" onClick={() => setSelectedPresetId(preset.id)} key={preset.id}><span className="preset-item-mark" /><span><strong>{preset.name}</strong><small>{new Date(preset.updatedAt).toLocaleDateString("ko-KR")} 저장</small></span></button>)}
            {!weightPresets.length && <div className="preset-empty">저장한 프리셋이 없습니다.</div>}
          </div>
          <Divider />
          <div className="preset-controls"><Button className="preset-apply" type="primary" onClick={() => applyPreset()}>선택한 프리셋 적용</Button>{selectedPreset && <Popconfirm title="이 프리셋을 삭제할까요?" description="삭제한 프리셋은 복구할 수 없습니다." okText="삭제" cancelText="취소" okButtonProps={{ danger: true }} onConfirm={deleteSelectedPreset}><Button danger icon={<DeleteOutlined />} aria-label="선택한 프리셋 삭제" /></Popconfirm>}</div>
        </Card><Card className="local-note" variant="borderless"><div className="local-note-icon">i</div><div><strong>기기별 보관</strong><p>프리셋과 입력값은 현재 브라우저에만 저장됩니다.</p></div></Card></aside>
      </main></Content>
    </Layout>
  </Layout>;
}

export default function Home() {
  return <ConfigProvider locale={koKR} theme={{ token: { colorPrimary: "#3f6f4c", colorInfo: "#3f6f4c", colorSuccess: "#2d9a58", colorWarning: "#c98b22", colorError: "#d24a48", colorText: "#182334", colorTextSecondary: "#6e7886", colorBgLayout: "#f5f7fb", borderRadius: 10, fontFamily: "var(--font-geist-sans), Pretendard, sans-serif" }, components: { Button: { primaryShadow: "0 5px 14px rgba(47, 103, 73, .18)" }, Card: { headerBg: "#ffffff" }, Input: { activeBorderColor: "#7f9d62", hoverBorderColor: "#91a879" }, Tabs: { itemSelectedColor: "#25344a", inkBarColor: "#6d8157" }, Menu: { darkItemBg: "#121d2d", darkItemSelectedBg: "#263b4a", darkSubMenuItemBg: "#121d2d", darkItemColor: "#aeb9c9", darkItemSelectedColor: "#ffffff" } } }}><AntApp><InputManager /></AntApp></ConfigProvider>;
}
