"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { App as AntApp, Badge, Button, Card, ConfigProvider, Divider, Flex, Input, Layout, Menu, Popconfirm, Space, Tag, Typography } from "antd";
import koKR from "antd/locale/ko_KR";
import { CheckCircleFilled, ControlOutlined, DatabaseOutlined, DeleteOutlined, EditOutlined, RocketOutlined, SaveOutlined, TeamOutlined, TrophyOutlined, UndoOutlined, UserOutlined, WarningFilled } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type FieldKind = "positive" | "integer" | "short" | "decimal" | "bar";
type FieldGroup = "weights" | "player" | "ship";
type Language = "ko" | "en";
type FieldDefinition = { key: string; label: string; koLabel?: string; kind: FieldKind; group: FieldGroup; recommended?: string; suffix?: string };
type WeightPreset = { id: string; name: string; values: Record<string, string>; updatedAt: string };
type FieldSection = { title: string; description: string; keys: string[] };
type ResourcePalette = { accent: string; ink: string; surface: string; border: string; glow: string };
type PlayerResourceSection = FieldSection & { key: string; enTitle: string; enDescription: string; palette: ResourcePalette; wide?: boolean };

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
  { key: "loopsFilled", label: "Loops Filled", koLabel: "완료한 Loop", kind: "integer", group: "player" },
  { key: "loopResets", label: "Loop Resets", koLabel: "Loop 초기화", kind: "integer", group: "player" },
  { key: "operationsDone", label: "Operations Done", koLabel: "완료한 Operation", kind: "short", group: "player" },
  { key: "studiesDone", label: "Studies Done", koLabel: "완료한 Study", kind: "short", group: "player" },
  ...Array.from({ length: 8 }, (_, index) => ({ key: `manualMk${index + 1}`, label: `Manual mk${index + 1}`, kind: "short" as const, group: "player" as const })),
  { key: "softwareTech", label: "Software Tech", kind: "short", group: "player" },
  { key: "lpDoublerBarFill", label: "LP Doubler Bar Fill", koLabel: "LP Doubler 게이지", kind: "bar", group: "player", suffix: "/ 10" },
  { key: "shardTickspeed", label: "Shard Tickspeed", koLabel: "Shard Tick 속도", kind: "decimal", group: "player", suffix: "sec" },
  { key: "equipmentBought", label: "Equipment Bought", koLabel: "구매한 Equipment", kind: "integer", group: "player" },
  { key: "totalResearchLevels", label: "Total Research Levels", koLabel: "전체 Research 레벨", kind: "integer", group: "player" },
  { key: "completedResearches", label: "Completed Researches", koLabel: "완료한 Research", kind: "integer", group: "player" },
];

const shipNames = ["Cradle", "Auxesia", "Zagreus", "Hephaestus", "Demeter", "Koios", "Zeus"];
const shipPalette: Record<string, ResourcePalette> = {
  Cradle: { accent: "#8d969f", ink: "#5d6872", surface: "#f3f5f7", border: "#c5cdd3", glow: "rgba(112, 124, 134, .16)" },
  Auxesia: { accent: "#ff9a31", ink: "#c76c16", surface: "#fff7e9", border: "#ffca7a", glow: "rgba(255, 154, 49, .17)" },
  Zagreus: { accent: "#ed4949", ink: "#bb3030", surface: "#fff1f1", border: "#f2a0a0", glow: "rgba(237, 73, 73, .16)" },
  Hephaestus: { accent: "#a8ca3d", ink: "#6f8e15", surface: "#f7fbe9", border: "#c9e47f", glow: "rgba(168, 202, 61, .18)" },
  Demeter: { accent: "#35bdd8", ink: "#0a829a", surface: "#effcff", border: "#8cdeeb", glow: "rgba(53, 189, 216, .16)" },
  Koios: { accent: "#b5a158", ink: "#796919", surface: "#fbf8e9", border: "#d9cf99", glow: "rgba(181, 161, 88, .17)" },
  Zeus: { accent: "#6f78ed", ink: "#4d56bd", surface: "#f1f2ff", border: "#aeb4f5", glow: "rgba(111, 120, 237, .16)" },
};
const playerPalette: Record<"level" | "generator" | "softwareTech" | "loop" | "shards" | "research" | "academy", ResourcePalette> = {
  level: { accent: "#9a70e8", ink: "#6d43bd", surface: "#f7f2ff", border: "#d9c6f5", glow: "rgba(154, 112, 232, .16)" },
  generator: shipPalette.Cradle,
  softwareTech: shipPalette.Auxesia,
  loop: shipPalette.Zagreus,
  shards: shipPalette.Demeter,
  research: shipPalette.Koios,
  academy: shipPalette.Zeus,
};
const playerResourceSections: PlayerResourceSection[] = [
  { key: "level", title: "레벨", enTitle: "Level", description: "Level과 LP 진행 상태입니다.", enDescription: "Current Level and LP progress.", keys: ["level", "lpDoublerBarFill"], palette: playerPalette.level },
  { key: "generator", title: "Generator", enTitle: "Generator", description: "Manual mk 진행도입니다.", enDescription: "Manual mk progress.", keys: [...Array.from({ length: 8 }, (_, index) => `manualMk${index + 1}`)], palette: playerPalette.generator, wide: true },
  { key: "softwareTech", title: "Software Tech", enTitle: "Software Tech", description: "Software Tech 진행도입니다.", enDescription: "Software Tech progress.", keys: ["softwareTech"], palette: playerPalette.softwareTech },
  { key: "loop", title: "Loop", enTitle: "Loop", description: "Loop 및 MP 진행 상태입니다.", enDescription: "Current Loop and MP progress.", keys: ["loopsFilled", "loopResets"], palette: playerPalette.loop },
  { key: "shards", title: "Shards", enTitle: "Shards", description: "Operation과 Shard 진행도입니다.", enDescription: "Operation and Shard progress.", keys: ["operationsDone", "shardTickspeed"], palette: playerPalette.shards },
  { key: "research", title: "Research", enTitle: "Research", description: "Equipment 및 Research 진행도입니다.", enDescription: "Equipment and Research progress.", keys: ["equipmentBought", "totalResearchLevels", "completedResearches"], palette: playerPalette.research },
  { key: "academy", title: "아카데미", enTitle: "Academy", description: "Academy Study 완료 기록입니다.", enDescription: "Completed Academy Study records.", keys: ["studiesDone"], palette: playerPalette.academy },
];
const weightPalette: Record<string, ResourcePalette> = {
  cells: { accent: "#37c979", ink: "#1f854d", surface: "#e9fbf1", border: "#a9e9c7", glow: "rgba(55, 201, 121, .15)" },
  modPoints: { accent: "#ff5f66", ink: "#c63a43", surface: "#fff0f0", border: "#ffc0c3", glow: "rgba(255, 95, 102, .16)" },
  shards: { accent: "#25b9e7", ink: "#087da4", surface: "#e9f9fe", border: "#a9e6f7", glow: "rgba(37, 185, 231, .16)" },
  research: { accent: "#9c9156", ink: "#6f6531", surface: "#f7f4e7", border: "#d8d0a2", glow: "rgba(156, 145, 86, .16)" },
  academyPoints: { accent: "#777ee8", ink: "#4f57bd", surface: "#f0f1ff", border: "#b9bef8", glow: "rgba(119, 126, 232, .16)" },
  materials: { accent: "#f4a93a", ink: "#b76e10", surface: "#fff6e6", border: "#ffd49c", glow: "rgba(244, 169, 58, .16)" },
  costReduction: shipPalette.Cradle,
  rankPoints: { accent: "#ffffff", ink: "#536171", surface: "#ffffff", border: "#d9dee6", glow: "rgba(114, 125, 142, .16)" },
};
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
const languageStorageKey = "cifi-orbit.ui-language.v1";
const defaultPresetId = "__recommended__";
const localizedText = {
  ko: {
    workspace: "작업 공간", inputManager: "입력값 관리", playerInput: "플레이어 진행도 입력", weights: "가중치", playerProgress: "플레이어 진행도", shipProgress: "함선 진행도", localProfile: "로컬 프로필", localProfileNote: "현재 기기에만 저장됩니다.",
    saved: "저장됨", changed: "개 변경됨", restore: "되돌리기", save: "입력값 저장", currentProfile: "현재 프로필", profileDescription: "자원 우선순위와 진행도 기록을 한 화면에서 관리합니다.",
    prioritySettings: "가중치 설정", playerProfile: "플레이어 진행도", shipProfile: "함선 진행도", weightsDescription: "각 자원의 우선순위를 설정합니다. 프리셋 적용 후 입력값 저장을 누르면 현재 프로필에 반영됩니다.", playerDescription: "각 통계의 현재 최고 장기 진행 기록을 입력하세요.", shipDescription: "각 함선의 현재 랭크와 승무원 수를 입력하세요.", rank: "랭크", crew: "승무원", rankAndCrew: "랭크 · 승무원",
    inputValue: "값 입력", recommended: "권장값", weightLibrary: "가중치 라이브러리", weightPresets: "가중치 프리셋", presetHelp: "가중치 8개 항목만 저장합니다. 다른 입력값에는 영향을 주지 않습니다.", newPreset: "새 가중치 프리셋 이름", savePreset: "저장", recommendedSet: "기본 권장값", recommendedWeightSet: "권장 가중치 세트", noPresets: "저장한 프리셋이 없습니다.", applyPreset: "선택한 프리셋 적용", deletePreset: "선택한 프리셋 삭제", deleteTitle: "이 프리셋을 삭제할까요?", deleteDescription: "삭제한 프리셋은 복구할 수 없습니다.", delete: "삭제", cancel: "취소", deviceStorage: "기기별 보관", deviceStorageNote: "프리셋과 입력값은 현재 브라우저에만 저장됩니다.",
    invalidShort: "숫자 또는 과학 표기 형식으로 입력하세요.", invalidNumber: "유효한 숫자를 입력하세요.", nonNegative: "0 이상의 값을 입력하세요.", positiveWeight: "가중치는 0보다 커야 합니다.", integer: "정수를 입력하세요.", barRange: "0부터 10 사이의 값을 입력하세요.", researchLimit: "완료 Research 수는 전체 Research 레벨보다 클 수 없습니다.",
    storageReadFailed: "저장된 설정을 읽지 못해 기본값으로 시작합니다.", validationFailed: "오류가 있는 입력값을 먼저 확인해 주세요.", savedValues: "입력값을 이 기기에 저장했습니다.", saveFailed: "입력값을 저장하지 못했습니다.", restored: "마지막 저장 상태로 되돌렸습니다.", missingPreset: "불러올 프리셋을 찾지 못했습니다.", appliedPreset: "가중치 프리셋을 불러왔습니다. 저장 버튼을 눌러 입력값에 반영하세요.", enterPresetName: "프리셋 이름을 입력해 주세요.", duplicatePreset: "같은 이름의 프리셋이 이미 있습니다.", presetSaved: "프리셋을 저장했습니다.", presetSaveFailed: "프리셋을 저장하지 못했습니다.", presetDeleted: "프리셋을 삭제했습니다.", presetDeleteFailed: "프리셋을 삭제하지 못했습니다.",
  },
  en: {
    workspace: "WORKSPACE", inputManager: "Input Manager", playerInput: "Player Progress Input", weights: "Weights", playerProgress: "Player Progress", shipProgress: "Ship Progress", localProfile: "Local profile", localProfileNote: "Saved only in this browser.",
    saved: "Saved", changed: "changed", restore: "Restore", save: "Save inputs", currentProfile: "CURRENT PROFILE", profileDescription: "Manage resource priorities and progress records in one place.",
    prioritySettings: "WEIGHT SETTINGS", playerProfile: "PLAYER PROFILE", shipProfile: "SHIP PROFILE", weightsDescription: "Set each resource priority. Apply a preset and save inputs to update the current profile.", playerDescription: "Enter your best Long Run records for each stat.", shipDescription: "Enter the current Rank and Crew for each ship.", rank: "Rank", crew: "Crew", rankAndCrew: "Rank & Crew",
    inputValue: "Enter value", recommended: "Recommended", weightLibrary: "WEIGHT LIBRARY", weightPresets: "Weight presets", presetHelp: "Only the eight Weight fields are stored. Other inputs are not affected.", newPreset: "New Weight preset name", savePreset: "Save", recommendedSet: "Recommended defaults", recommendedWeightSet: "Recommended Weight set", noPresets: "No saved presets.", applyPreset: "Apply selected preset", deletePreset: "Delete selected preset", deleteTitle: "Delete this preset?", deleteDescription: "Deleted presets cannot be recovered.", delete: "Delete", cancel: "Cancel", deviceStorage: "Device storage", deviceStorageNote: "Presets and inputs are stored in this browser only.",
    invalidShort: "Enter a number or scientific notation.", invalidNumber: "Enter a valid number.", nonNegative: "Enter 0 or more.", positiveWeight: "Weights must be greater than 0.", integer: "Enter a whole number.", barRange: "Enter a value from 0 to 10.", researchLimit: "Completed Researches cannot exceed total Research Levels.",
    storageReadFailed: "Saved settings could not be read. Starting with defaults.", validationFailed: "Fix invalid inputs first.", savedValues: "Inputs saved to this device.", saveFailed: "Could not save inputs.", restored: "Restored the last saved values.", missingPreset: "The preset could not be found.", appliedPreset: "Weight preset loaded. Save inputs to apply it to this profile.", enterPresetName: "Enter a preset name.", duplicatePreset: "A preset with that name already exists.", presetSaved: "Preset saved.", presetSaveFailed: "Could not save the preset.", presetDeleted: "Preset deleted.", presetDeleteFailed: "Could not delete the preset.",
  },
} satisfies Record<Language, Record<string, string>>;

function createInitialValues() {
  return Object.fromEntries(allFields.map((field) => [field.key, field.recommended ?? ""])) as Record<string, string>;
}

function fieldLabel(field: FieldDefinition, language: Language) {
  return language === "ko" ? field.koLabel ?? field.label : field.label;
}

function validateField(field: FieldDefinition, rawValue: string, language: Language) {
  const text = localizedText[language];
  const value = rawValue.trim().replaceAll(",", "");
  if (!value) return "";
  if (field.kind === "short") {
    return /^(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+|k|m|b|t|qa|qu|sx|sp|o|n|d)?$/i.test(value) ? "" : text.invalidShort;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return text.invalidNumber;
  if (parsed < 0) return text.nonNegative;
  if (field.kind === "positive" && parsed <= 0) return text.positiveWeight;
  if ((field.kind === "integer" || field.kind === "bar") && !Number.isInteger(parsed)) return text.integer;
  if (field.kind === "bar" && parsed > 10) return text.barRange;
  return "";
}

function groupLabel(group: FieldGroup, language: Language) {
  const text = localizedText[language];
  return group === "weights" ? text.weights : group === "player" ? text.playerProgress : text.shipProgress;
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
  const [language, setLanguage] = useState<Language>("ko");
  const text = localizedText[language];

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
      const storedLanguage = window.localStorage.getItem(languageStorageKey);
      if (storedLanguage === "ko" || storedLanguage === "en") setLanguage(storedLanguage);
    } catch {
      message.warning(localizedText.ko.storageReadFailed);
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
      const error = validateField(field, draft[field.key] ?? "", language);
      if (error) next[field.key] = error;
    }
    if (draft.totalResearchLevels && draft.completedResearches && Number(draft.completedResearches) > Number(draft.totalResearchLevels)) next.completedResearches = text.researchLimit;
    return next;
  }, [draft, language, text.researchLimit]);
  const changedKeys = useMemo(() => allFields.filter((field) => (draft[field.key] ?? "") !== (saved[field.key] ?? "")).map((field) => field.key), [draft, saved]);
  const recommendedWeights = useMemo(() => Object.fromEntries(weightFields.map((field) => [field.key, field.recommended ?? ""])), []);
  const selectedPreset = selectedPresetId === defaultPresetId ? undefined : weightPresets.find((preset) => preset.id === selectedPresetId);
  const updateValue = (key: string, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const updateLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    try { window.localStorage.setItem(languageStorageKey, nextLanguage); } catch { /* language can remain session-only */ }
  };

  const saveValues = () => {
    if (Object.keys(errors).length) return void message.error(text.validationFailed);
    try {
      window.localStorage.setItem(inputStorageKey, JSON.stringify({ version: 1, values: draft }));
      setSaved({ ...draft });
      message.success(text.savedValues);
    } catch { message.error(text.saveFailed); }
  };
  const restoreSaved = () => { setDraft({ ...saved }); message.info(text.restored); };
  const applyPreset = (presetId = selectedPresetId) => {
    const presetValues = presetId === defaultPresetId ? recommendedWeights : weightPresets.find((preset) => preset.id === presetId)?.values;
    if (!presetValues) return void message.error(text.missingPreset);
    setSelectedPresetId(presetId);
    setActiveTab("weights");
    setDraft((current) => ({ ...current, ...Object.fromEntries(weightFields.map((field) => [field.key, presetValues[field.key] ?? field.recommended ?? ""])) }));
    message.success(text.appliedPreset);
  };
  const saveWeightPreset = () => {
    const name = presetName.trim();
    if (!name) return void message.error(text.enterPresetName);
    if (weightPresets.some((preset) => preset.name === name)) return void message.error(text.duplicatePreset);
    const preset: WeightPreset = { id: `weight-${Date.now()}`, name, values: Object.fromEntries(weightFields.map((field) => [field.key, draft[field.key] ?? ""])), updatedAt: new Date().toISOString() };
    const next = [...weightPresets, preset];
    try {
      window.localStorage.setItem(presetStorageKey, JSON.stringify(next));
      setWeightPresets(next); setSelectedPresetId(preset.id); setPresetName("");
      message.success(`“${name}” ${text.presetSaved}`);
    } catch { message.error(text.presetSaveFailed); }
  };
  const deleteSelectedPreset = () => {
    if (!selectedPreset) return;
    const next = weightPresets.filter((preset) => preset.id !== selectedPreset.id);
    try {
      window.localStorage.setItem(presetStorageKey, JSON.stringify(next));
      setWeightPresets(next); setSelectedPresetId(defaultPresetId);
      message.success(`“${selectedPreset.name}” ${text.presetDeleted}`);
    } catch { message.error(text.presetDeleteFailed); }
  };

  const fieldsByGroup: Record<FieldGroup, FieldDefinition[]> = { weights: weightFields, player: playerFields, ship: shipFields };
  const renderField = (field: FieldDefinition) => {
    const error = errors[field.key];
    return <label className={`field-row ${error ? "has-error" : ""}`} key={field.key}>
      <span className="field-label"><strong>{fieldLabel(field, language)}</strong><small>{field.recommended ? `${text.recommended} ${field.recommended}` : ""}</small></span>
      <Input aria-label={fieldLabel(field, language)} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder={field.kind === "short" ? "1k, 2.22b, 4.33e12" : text.inputValue} inputMode={field.kind === "short" ? "text" : field.kind === "integer" || field.kind === "bar" ? "numeric" : "decimal"} suffix={field.suffix} />
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
  const renderWeightField = (field: FieldDefinition) => {
    const error = errors[field.key];
    const palette = weightPalette[field.key];
    return <section className={`weight-input-card ${error ? "has-error" : ""}`} style={resourceCardStyle(palette)} key={field.key}>
      <div className="weight-card-heading"><span className="weight-card-dot" /><div><h4>{fieldLabel(field, language)}</h4><p>{text.recommended} {field.recommended}</p></div></div>
      <Input aria-label={fieldLabel(field, language)} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder={text.inputValue} inputMode="numeric" />
      {error && <small>{error}</small>}
    </section>;
  };
  const renderPlayerField = (field: FieldDefinition) => {
    const error = errors[field.key];
    return <label className={`player-field ${error ? "has-error" : ""}`} key={field.key}>
      <span>{fieldLabel(field, language)}</span>
      <Input aria-label={fieldLabel(field, language)} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder={text.inputValue} inputMode={field.kind === "short" ? "text" : field.kind === "integer" || field.kind === "bar" ? "numeric" : "decimal"} suffix={field.suffix} />
      {error && <small>{error}</small>}
    </label>;
  };
  const fieldPanel = (fields: FieldDefinition[], group: FieldGroup) => (
    <div className={`field-panel field-panel-${group}`}>
      <div className="field-panel-heading">
        <div className={`panel-symbol panel-symbol-${group}`}>{group === "weights" ? "W" : group === "player" ? "P" : "S"}</div>
        <Title level={3}>{groupLabel(group, language)}</Title>
        <Paragraph>{group === "weights" ? text.weightsDescription : group === "player" ? text.playerDescription : text.shipDescription}</Paragraph>
      </div>
      {group === "weights" ? <div className="weight-card-grid">{fields.map(renderWeightField)}</div> : group === "ship" ? <div className="ship-card-grid">
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
            <div className="ship-card-heading"><span className="ship-card-dot" /><div><h4>{ship}</h4><p>{text.rankAndCrew}</p></div></div>
            <div className="ship-field-stack">
              {shipGroup.map((field) => {
                const error = errors[field.key];
                return <label className={`ship-field ${error ? "has-error" : ""}`} key={field.key}>
                  <span className="ship-field-label">{isRank(field) ? <TrophyOutlined aria-hidden /> : <TeamOutlined aria-hidden />}{isRank(field) ? text.rank : text.crew}</span>
                  <Input aria-label={fieldLabel(field, language)} value={draft[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)} status={error ? "error" : undefined} placeholder={text.inputValue} inputMode="numeric" />
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
            <div className="player-card-heading"><span className="player-card-dot" /><div><h4>{language === "ko" ? section.title : section.enTitle}</h4><p>{language === "ko" ? section.description : section.enDescription}</p></div><Badge count={sectionFields.length} /></div>
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
  return <Layout className="dashboard-shell">
    <Sider className="dashboard-sider" width={238} trigger={null}>
      <div className="sidebar-brand"><div className="brand-cell"><DatabaseOutlined /></div><div><strong>CIFI ORBIT</strong><span>MOD TREE CULTIVATOR</span></div></div>
      <div className="sidebar-caption">{text.workspace}</div>
      <Menu className="sidebar-menu" theme="dark" mode="inline" selectedKeys={[activeTab]} defaultOpenKeys={["player-input"]} onClick={({ key }) => { if (key !== "player-input") setActiveTab(key as FieldGroup); }} items={[
        { key: "player-input", icon: <EditOutlined />, label: text.playerInput, children: [
          { key: "weights", icon: <ControlOutlined />, label: text.weights },
          { key: "player", icon: <UserOutlined />, label: text.playerProgress },
          { key: "ship", icon: <RocketOutlined />, label: text.shipProgress },
        ] },
      ]} />
      <div className="sidebar-foot"><div className="sidebar-foot-chip"><span className="sidebar-foot-dot" />{text.localProfile}</div><p>{text.localProfileNote}</p></div>
    </Sider>
    <Layout className="dashboard-main">
      <Header className="dashboard-header"><div><Text className="header-eyebrow">MOD TREE / {groupLabel(activeTab, language).toUpperCase()}</Text><Title level={4}>{text.inputManager}</Title></div><Space size={10} wrap><Space className="language-toggle" size={3}><Button type={language === "ko" ? "primary" : "default"} size="small" aria-pressed={language === "ko"} onClick={() => updateLanguage("ko")}>한국어</Button><Button type={language === "en" ? "primary" : "default"} size="small" aria-pressed={language === "en"} onClick={() => updateLanguage("en")}>EN</Button></Space><Tag color={changedKeys.length ? "gold" : "green"} icon={changedKeys.length ? <WarningFilled /> : <CheckCircleFilled />}>{changedKeys.length ? `${changedKeys.length} ${text.changed}` : text.saved}</Tag><Button icon={<UndoOutlined />} disabled={!changedKeys.length} onClick={restoreSaved}>{text.restore}</Button><Button type="primary" icon={<SaveOutlined />} disabled={!ready || !changedKeys.length || Boolean(Object.keys(errors).length)} onClick={saveValues}>{text.save}</Button></Space></Header>
      <Content className="dashboard-content"><main className="workspace-grid">
        <section className="input-workspace"><div className="workspace-intro"><div><Text className="section-kicker">{text.currentProfile}</Text><Title>Mod Tree Profile</Title><Paragraph>{text.profileDescription}</Paragraph></div></div><Card className="input-card" variant="borderless">{fieldPanel(fieldsByGroup[activeTab], activeTab)}</Card></section>
        <aside className="preset-sidebar" aria-label={text.weightPresets}><Card className="preset-card" title={<div><Text className="section-kicker">{text.weightLibrary}</Text><div className="preset-card-title">{text.weightPresets}</div></div>} extra={<Badge count={weightPresets.length} showZero color="#708458" />}>
          <Paragraph className="preset-help">{text.presetHelp}</Paragraph>
          <div className="preset-create"><Input aria-label={text.newPreset} value={presetName} maxLength={32} placeholder={text.newPreset} onChange={(event) => setPresetName(event.target.value)} onPressEnter={saveWeightPreset} /><Button type="primary" onClick={saveWeightPreset}>{text.savePreset}</Button></div>
          <Divider />
          <div className="preset-list" role="list" aria-label={text.weightPresets}>
            <button className={`preset-item ${selectedPresetId === defaultPresetId ? "selected" : ""}`} type="button" onClick={() => setSelectedPresetId(defaultPresetId)}><span className="preset-item-mark default" /><span><strong>{text.recommendedSet}</strong><small>{text.recommendedWeightSet}</small></span></button>
            {weightPresets.map((preset) => <button className={`preset-item ${selectedPresetId === preset.id ? "selected" : ""}`} type="button" onClick={() => setSelectedPresetId(preset.id)} key={preset.id}><span className="preset-item-mark" /><span><strong>{preset.name}</strong><small>{new Date(preset.updatedAt).toLocaleDateString(language === "ko" ? "ko-KR" : "en-US")} {text.savePreset}</small></span></button>)}
            {!weightPresets.length && <div className="preset-empty">{text.noPresets}</div>}
          </div>
          <Divider />
          <div className="preset-controls"><Button className="preset-apply" type="primary" onClick={() => applyPreset()}>{text.applyPreset}</Button>{selectedPreset && <Popconfirm title={text.deleteTitle} description={text.deleteDescription} okText={text.delete} cancelText={text.cancel} okButtonProps={{ danger: true }} onConfirm={deleteSelectedPreset}><Button danger icon={<DeleteOutlined />} aria-label={text.deletePreset} /></Popconfirm>}</div>
        </Card><Card className="local-note" variant="borderless"><div className="local-note-icon">i</div><div><strong>{text.deviceStorage}</strong><p>{text.deviceStorageNote}</p></div></Card></aside>
      </main></Content>
    </Layout>
  </Layout>;
}

export default function Home() {
  return <ConfigProvider locale={koKR} theme={{ token: { colorPrimary: "#3f6f4c", colorInfo: "#3f6f4c", colorSuccess: "#2d9a58", colorWarning: "#c98b22", colorError: "#d24a48", colorText: "#182334", colorTextSecondary: "#6e7886", colorBgLayout: "#f5f7fb", borderRadius: 10, fontFamily: "var(--font-geist-sans), Pretendard, sans-serif" }, components: { Button: { primaryShadow: "0 5px 14px rgba(47, 103, 73, .18)" }, Card: { headerBg: "#ffffff" }, Input: { activeBorderColor: "#7f9d62", hoverBorderColor: "#91a879" }, Menu: { darkItemBg: "#121d2d", darkItemSelectedBg: "#263b4a", darkSubMenuItemBg: "#121d2d", darkItemColor: "#aeb9c9", darkItemSelectedColor: "#ffffff" } } }}><AntApp><InputManager /></AntApp></ConfigProvider>;
}
