"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, Key, ReactNode } from "react";
import {
  App as AntApp,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Divider,
  Drawer,
  Flex,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Progress,
  Segmented,
  Select,
  Slider,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import type { TableColumnsType } from "antd";
import koKR from "antd/locale/ko_KR";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  CheckCircleFilled,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  CompassOutlined,
  ControlOutlined,
  CrownOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FundOutlined,
  MenuOutlined,
  RocketOutlined,
  SearchOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type ResourceKey = "cells" | "mods" | "shards" | "research" | "academy" | "materials";

const resourceMeta: Record<ResourceKey, { label: string; color: string; soft: string }> = {
  cells: { label: "Cells", color: "#37c979", soft: "#e9fbf1" },
  mods: { label: "Mod Points", color: "#ff5f66", soft: "#fff0f0" },
  shards: { label: "Shards", color: "#25b9e7", soft: "#e9f9fe" },
  research: { label: "Research", color: "#9c9156", soft: "#f7f4e7" },
  academy: { label: "Academy", color: "#777ee8", soft: "#f0f1ff" },
  materials: { label: "Materials", color: "#f4a93a", soft: "#fff6e6" },
};

const resourceCards = [
  { key: "cells" as const, value: "8.42e63", delta: "+14.8%", percent: 78 },
  { key: "mods" as const, value: "3.13e40", delta: "+8.2%", percent: 64 },
  { key: "shards" as const, value: "4.09e2", delta: "다음: 1.97e39", percent: 46 },
  { key: "research" as const, value: "34", delta: "8 완료", percent: 86 },
];

type Recommendation = {
  key: string;
  area: string;
  name: string;
  cost: string;
  score: number;
  accent: string;
  reason: string;
};

const recommendationRows: Recommendation[] = [
  {
    key: "d-mod-points",
    area: "Diamonds",
    name: "Mod Points Boost",
    cost: "300",
    score: 98.19,
    accent: resourceMeta.mods.color,
    reason: "비용 대비 Mod Points 증가량이 현재 가중치에서 가장 높음",
  },
  {
    key: "ship-cra10",
    area: "Ships",
    name: "Cra10 · On-Site Mining Printers",
    cost: "1 rank",
    score: 94.72,
    accent: "#6f87a8",
    reason: "Shards 배율과 함선 설치 Power를 동시에 개선",
  },
  {
    key: "mtc-eb2",
    area: "Mod Tree",
    name: "Bulk Auxesia Automation Module",
    cost: "2.07e39",
    score: 91.34,
    accent: resourceMeta.shards.color,
    reason: "구매 가능 후보 중 누적 Value 1위",
  },
  {
    key: "token-t2",
    area: "Tokens",
    name: "Tier 2 · Cell Efficiency",
    cost: "1.28e5",
    score: 84.06,
    accent: resourceMeta.cells.color,
    reason: "Cells 우선순위 1 기준의 안정적인 다음 구매",
  },
];

type ModRow = {
  key: string;
  code: string;
  name: string;
  current: number;
  amount: number;
  finish: number;
  cost: string;
};

const modRows: ModRow[] = [
  { key: "EB2", code: "EB2", name: "Bulk Auxesia Automation Module", current: 3, amount: 1, finish: 4, cost: "2.07e39" },
  { key: "G02", code: "G02", name: "Enhanced Shard Mining Equipment MK1", current: 115, amount: 1, finish: 116, cost: "3.05e39" },
  { key: "E17", code: "E17", name: "Hephaestus Cost Modification Module", current: 28, amount: 2, finish: 30, cost: "3.02e40" },
  { key: "H01", code: "H01", name: "Cell Multiplication Module MK1", current: 190, amount: 4, finish: 194, cost: "4.69e40" },
  { key: "C30", code: "C30", name: "MK3 Gen Enhancement Modification Module", current: 99, amount: 3, finish: 102, cost: "6.15e40" },
];

const diamondRows = [
  { key: "mod-points", group: "Special", name: "Mod Points Boost", level: "1 / 1", power: "+1 Mod Point", cost: "300", score: 98.19, tone: "mods" as const },
  { key: "cell-boost", group: "Cells", name: "Cell Production Boost", level: "12 / 25", power: "×1.08 Cells", cost: "2.45e4", score: 78.42, tone: "cells" as const },
  { key: "shard-boost", group: "Shards", name: "Shard Mining Boost", level: "7 / 20", power: "×1.15 Shards", cost: "8.20e4", score: 74.66, tone: "shards" as const },
  { key: "research-boost", group: "Research", name: "Research Yield Boost", level: "4 / 15", power: "×1.05 Research", cost: "1.55e5", score: 69.23, tone: "research" as const },
];

const shipRows = [
  { key: "cra10", name: "Cra10 · On-Site Mining Printers", rank: 23, install: "1.88e12", next: "×1.79", score: 94.72, status: "추천" },
  { key: "cra8", name: "Cra8 · Adaptive Mining Arrays", rank: 17, install: "6.24e10", next: "×1.42", score: 81.66, status: "가능" },
  { key: "exm4", name: "Exm4 · Research Relay", rank: 8, install: "4.90e9", next: "×1.21", score: 68.11, status: "대기" },
  { key: "sol2", name: "Sol2 · Cell Catalyst", rank: 31, install: "1.73e13", next: "×1.15", score: 55.04, status: "잠금" },
];

const navItems = [
  { key: "overview", icon: <DashboardOutlined />, label: "통합 추천" },
  { key: "resources", icon: <DatabaseOutlined />, label: "자원 현황" },
  { key: "upgrades", icon: <ThunderboltFilled />, label: "업그레이드" },
  { key: "ships", icon: <RocketOutlined />, label: "함선 · 랭크" },
  { key: "mods", icon: <AppstoreOutlined />, label: "Mod Tree" },
  { key: "settings", icon: <ControlOutlined />, label: "가중치 · 설정" },
];

function PrototypeApp() {
  const { message } = AntApp.useApp();
  const [activeNav, setActiveNav] = useState("overview");
  const [budget, setBudget] = useState<number | null>(2500);
  const [planMode, setPlanMode] = useState("균형");
  const [priority, setPriority] = useState<Record<ResourceKey, number>>({
    cells: 1,
    mods: 12,
    shards: 10,
    research: 8,
    academy: 24,
    materials: 72,
  });
  const [selectedMods, setSelectedMods] = useState<Key[]>(["EB2", "G02", "E17"]);
  const [importOpen, setImportOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [affordableOnly, setAffordableOnly] = useState(true);
  const [unlockedOnly, setUnlockedOnly] = useState(true);

  const selectedModRows = useMemo(
    () => modRows.filter((row) => selectedMods.includes(row.key)),
    [selectedMods],
  );

  const recommendationColumns: TableColumnsType<Recommendation> = [
    {
      title: "추천",
      dataIndex: "name",
      render: (_, row, index) => (
        <Flex align="center" gap={12}>
          <div className="rank-badge" style={{ background: row.accent }}>{index + 1}</div>
          <div>
            <Space size={6} wrap>
              <Text strong>{row.name}</Text>
              <Tag bordered={false}>{row.area}</Tag>
            </Space>
            <div className="table-subtext">{row.reason}</div>
          </div>
        </Flex>
      ),
    },
    {
      title: "비용",
      dataIndex: "cost",
      width: 112,
      render: (value) => <Text className="mono-value">{value}</Text>,
    },
    {
      title: "효율",
      dataIndex: "score",
      width: 138,
      render: (value, row) => (
        <Flex vertical gap={4}>
          <Text strong>{value.toFixed(2)}</Text>
          <Progress percent={value} showInfo={false} strokeColor={row.accent} size="small" />
        </Flex>
      ),
    },
  ];

  const modColumns: TableColumnsType<ModRow> = [
    {
      title: "모드",
      dataIndex: "name",
      render: (value, row) => (
        <div>
          <Text strong>{value}</Text>
          <div className="table-subtext"><span className="code-chip">{row.code}</span> 현재 Lv.{row.current}</div>
        </div>
      ),
    },
    { title: "구매", dataIndex: "amount", width: 74, render: (value) => `+${value}` },
    { title: "완료", dataIndex: "finish", width: 78, render: (value) => `Lv.${value}` },
    { title: "비용", dataIndex: "cost", width: 112, render: (value) => <span className="mono-value">{value}</span> },
  ];

  const handleBuildPlan = () => {
    message.success(`${planMode} 모드로 ${budget?.toLocaleString() ?? 0} 예산의 구매 계획을 갱신했습니다.`);
  };

  const pageMeta: Record<string, { crumb: string; title: string; description: string }> = {
    overview: { crumb: "TODAY'S PLAN", title: "통합 구매 시트", description: "CIFI Optimizer와 Mod Tree Cultivator의 현재 추천을 한 장의 계획표로 묶었습니다." },
    resources: { crumb: "RESOURCE LEDGER", title: "자원 현황 시트", description: "각 자원의 현재 값·다음 목표·추천 가중치를 시트처럼 한눈에 확인합니다." },
    upgrades: { crumb: "CIFI / DIAMONDS", title: "Diamonds 업그레이드", description: "Named range 기준의 비용과 Diamond Power를 비교합니다." },
    ships: { crumb: "CIFI / SHIPS", title: "함선 · 랭크 계산", description: "현재 랭크와 다음 설치 Power의 변화량을 비교합니다." },
    mods: { crumb: "MTC / MODCALC", title: "Mod Tree 계산표", description: "해금·구매 가능 여부와 추천 우선순위를 행 단위로 검토합니다." },
    settings: { crumb: "MODEL SETTINGS", title: "가중치 · 계산 설정", description: "시트의 named range와 추천 엔진 입력값을 명시적으로 관리합니다." },
  };
  const currentPage = pageMeta[activeNav] ?? pageMeta.overview;

  const workbookFrame = (sheet: string, range: string, formula: string, children: ReactNode) => (
    <section className="workbook-frame" aria-label={`${sheet} 시트`}>
      <div className="workbook-topline">
        <Space size={8}><span className="workbook-dot" /><Text strong>{sheet}</Text><Tag bordered={false}>읽기 전용 프로토타입</Tag></Space>
        <Text type="secondary">CIFI v1.10.30 · MTC v1.2.0.11</Text>
      </div>
      <div className="formula-bar">
        <span className="range-box">{range}</span>
        <span className="formula-symbol">fx</span>
        <code>{formula}</code>
      </div>
      {children}
    </section>
  );

  const diamondColumns: TableColumnsType<(typeof diamondRows)[number]> = [
    { title: "영역", dataIndex: "group", width: 108, render: (value, row) => <Tag color={resourceMeta[row.tone].color}>{value}</Tag> },
    { title: "업그레이드 / named key", dataIndex: "name", render: (value, row) => <div><Text strong>{value}</Text><div className="table-subtext"><span className="code-chip">diamond.{row.key}</span> named range</div></div> },
    { title: "현재", dataIndex: "level", width: 98, render: (value) => <span className="mono-value">{value}</span> },
    { title: "다음 효과", dataIndex: "power", width: 130 },
    { title: "비용", dataIndex: "cost", width: 100, render: (value) => <span className="mono-value">{value}</span> },
    { title: "Diamond Power", dataIndex: "score", width: 145, render: (value, row) => <Flex vertical gap={4}><Text strong>{value.toFixed(2)}</Text><Progress percent={value} showInfo={false} strokeColor={resourceMeta[row.tone].color} size="small" /></Flex> },
  ];

  const shipColumns: TableColumnsType<(typeof shipRows)[number]> = [
    { title: "함선 / 설치", dataIndex: "name", render: (value, row) => <div><Text strong>{value}</Text><div className="table-subtext"><span className="code-chip">ships.{row.key}</span> 설치 Power {row.install}</div></div> },
    { title: "현재 Rank", dataIndex: "rank", width: 104, render: (value) => <span className="mono-value">{value}</span> },
    { title: "다음/현재", dataIndex: "next", width: 116, render: (value) => <Tag color="blue">{value}</Tag> },
    { title: "Incr. Power", dataIndex: "score", width: 138, render: (value) => <Progress percent={value} format={() => value.toFixed(2)} strokeColor="#6f87a8" /> },
    { title: "상태", dataIndex: "status", width: 86, render: (value) => <Tag color={value === "추천" ? "green" : value === "잠금" ? "default" : "blue"}>{value}</Tag> },
  ];

  return (
    <Layout className="app-shell">
      <Sider width={248} className="app-sider" breakpoint="lg" collapsedWidth={0} trigger={null}>
        <div className="brand-block">
          <div className="brand-mark"><CompassOutlined /></div>
          <div>
            <div className="brand-name">CIFI ORBIT</div>
            <div className="brand-sub">UNIFIED OPTIMIZER</div>
          </div>
        </div>
        <div className="season-card">
          <Flex justify="space-between" align="center">
            <span className="eyebrow">PRE-OURO PROFILE</span>
            <Badge status="success" text="동기화됨" />
          </Flex>
          <Title level={4}>진행도 86</Title>
          <Progress percent={72} showInfo={false} strokeColor="#7f8cff" trailColor="rgba(255,255,255,.11)" />
          <Text>다음 마일스톤까지 28%</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeNav]}
          items={navItems}
          onClick={({ key }) => setActiveNav(key)}
          className="main-menu"
        />
        <div className="sider-footer">
          <div className="engine-dot" />
          <div>
            <Text>프로토타입 엔진</Text>
            <span>샘플 규칙 · 로컬 상태</span>
          </div>
        </div>
      </Sider>

      <Layout>
        <Header className="top-header">
          <Flex align="center" gap={12} className="mobile-brand">
            <div className="brand-mark small"><CompassOutlined /></div>
            <Text strong>CIFI ORBIT</Text>
          </Flex>
          <Input prefix={<SearchOutlined />} placeholder="업그레이드, 함선, 모드 검색" className="global-search" />
          <Space>
            <Tooltip title="시트 데이터 가져오기">
              <Button icon={<CloudDownloadOutlined />} onClick={() => setImportOpen(true)}>가져오기</Button>
            </Tooltip>
            <Badge count={selectedMods.length} color="#ff5f66">
              <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => setCartOpen(true)}>구매 계획</Button>
            </Badge>
            <Avatar className="profile-avatar">86</Avatar>
          </Space>
        </Header>

        <Content className="app-content">
          <div className="content-wrap">
            <Flex justify="space-between" align="flex-end" gap={20} className="page-heading" wrap>
              <div>
                <Space size={8} className="breadcrumb-row">
                  <span>OPTIMIZER</span><span>/</span><span>{currentPage.crumb}</span>
                </Space>
                <Title>{currentPage.title}</Title>
                <Paragraph>{currentPage.description}</Paragraph>
              </div>
              <Space wrap>
                <Segmented options={["균형", "장기 성장", "빠른 루프"]} value={planMode} onChange={(value) => setPlanMode(String(value))} />
                <InputNumber min={0} value={budget} onChange={setBudget} addonBefore="예산" addonAfter="Diamonds" />
                <Button type="primary" icon={<FundOutlined />} onClick={handleBuildPlan}>계획 계산</Button>
              </Space>
            </Flex>

            <div className="sheet-tab-strip" role="tablist" aria-label="시트 탐색">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={activeNav === item.key}
                  className={activeNav === item.key ? "active" : ""}
                  onClick={() => setActiveNav(item.key)}
                >
                  {item.icon}<span>{item.label}</span>
                </button>
              ))}
            </div>

            {activeNav === "overview" && <>
            <section className="resource-grid" aria-label="자원 현황">
              {resourceCards.map((item) => {
                const meta = resourceMeta[item.key];
                return (
                  <Card key={item.key} className="resource-card" style={{ "--resource-color": meta.color, "--resource-soft": meta.soft } as CSSProperties}>
                    <Flex justify="space-between" align="flex-start">
                      <div className="resource-icon"><ThunderboltFilled /></div>
                      <Tag bordered={false} className="delta-tag">{item.delta}</Tag>
                    </Flex>
                    <Text>{meta.label}</Text>
                    <div className="resource-value">{item.value}</div>
                    <Progress percent={item.percent} showInfo={false} strokeColor={meta.color} trailColor={meta.soft} />
                  </Card>
                );
              })}
            </section>

            <section className="focus-panel">
              <div className="focus-glow" />
              <div>
                <Space className="focus-kicker"><CrownOutlined /> NEXT BEST ACTION</Space>
                <Title level={2}>Mod Points Boost</Title>
                <Paragraph>
                  현재 가중치에서 비용 대비 효율 <strong>98.19</strong>. 다음 Diamonds 구매로 진행하면
                  Mod Tree 추천 폭이 가장 크게 넓어집니다.
                </Paragraph>
                <Space wrap>
                  <Tag color="error">Diamonds · Special</Tag>
                  <Tag color="green">구매 가능</Tag>
                  <Tag>예상 비용 300</Tag>
                </Space>
              </div>
              <div className="focus-action">
                <Statistic title="다음 단계 효율" value={98.19} precision={2} suffix="/ 100" />
                <Button type="primary" size="large" onClick={() => message.success("Mod Points Boost를 구매 계획에 추가했습니다.")}>계획에 추가 <ArrowRightOutlined /></Button>
              </div>
            </section>

            <div className="main-grid">
              <Card className="panel-card recommendation-card" title={<PanelTitle icon={<BarChartOutlined />} title="통합 추천 큐" subtitle="CIFI + Mod Tree" />} extra={<Button type="text">전체 보기</Button>}>
                <Table columns={recommendationColumns} dataSource={recommendationRows} pagination={false} size="middle" />
              </Card>

              <Card className="panel-card priority-card" title={<PanelTitle icon={<ControlOutlined />} title="자원 가중치" subtitle="추천 점수에 즉시 반영" />}>
                <Flex vertical gap={16}>
                  {(Object.keys(priority) as ResourceKey[]).map((key) => {
                    const meta = resourceMeta[key];
                    return (
                      <div className="priority-row" key={key}>
                        <Flex justify="space-between" align="center">
                          <Space><span className="color-dot" style={{ background: meta.color }} /><Text strong>{meta.label}</Text></Space>
                          <InputNumber min={1} max={100} value={priority[key]} onChange={(value) => setPriority((current) => ({ ...current, [key]: value ?? 1 }))} size="small" />
                        </Flex>
                        <Slider min={1} max={100} value={priority[key]} onChange={(value) => setPriority((current) => ({ ...current, [key]: value }))} styles={{ track: { background: meta.color }, handle: { borderColor: meta.color } }} />
                      </div>
                    );
                  })}
                </Flex>
                <Divider />
                <Button block icon={<SwapOutlined />} onClick={() => setPriority({ cells: 1, mods: 12, shards: 10, research: 8, academy: 24, materials: 72 })}>시트 권장값 복원</Button>
              </Card>
            </div>

            <Card className="panel-card shopping-card" title={<PanelTitle icon={<ShoppingCartOutlined />} title="Mod Tree 쇼핑 목록" subtitle={`${selectedMods.length}개 선택 · 시트식 일괄 구매 흐름`} />} extra={
              <Space split={<Divider type="vertical" />}>
                <Space><Switch checked={affordableOnly} onChange={setAffordableOnly} size="small" /><Text>구매 가능만</Text></Space>
                <Space><Switch checked={unlockedOnly} onChange={setUnlockedOnly} size="small" /><Text>해금만</Text></Space>
              </Space>
            }>
              <Table
                columns={modColumns}
                dataSource={modRows}
                pagination={false}
                rowSelection={{ selectedRowKeys: selectedMods, onChange: setSelectedMods }}
                scroll={{ x: 760 }}
              />
              <Flex justify="space-between" align="center" gap={16} className="shopping-summary" wrap>
                <Space size="large" wrap>
                  <Statistic title="선택 모드" value={selectedMods.length} suffix="개" />
                  <Statistic title="총 구매 레벨" value={selectedModRows.reduce((sum, row) => sum + row.amount, 0)} suffix="Lv" />
                  <Statistic title="예상 비용" value="3.53e40" />
                </Space>
                <Space>
                  <Button onClick={() => setSelectedMods([])}>목록 비우기</Button>
                  <Button type="primary" icon={<CheckCircleFilled />} onClick={() => setCartOpen(true)}>구매 계획 검토</Button>
                </Space>
              </Flex>
            </Card>
            </>}

            {activeNav === "resources" && workbookFrame("Resource Ledger", "C5", "=Current_Value / Next_Milestone", <>
              <div className="sheet-summary-row">
                <Text>색상은 원본 자원 분류를 유지하고, 숫자는 UI 표시용 샘플입니다.</Text>
                <Tag color="green">모든 값 동기화됨</Tag>
              </div>
              <Table
                className="sheet-table"
                rowKey="key"
                pagination={false}
                dataSource={(Object.keys(priority) as ResourceKey[]).map((key, index) => ({ key, no: index + 1, ...resourceMeta[key], value: resourceCards.find((item) => item.key === key)?.value ?? "—", weight: priority[key], target: key === "materials" ? "다음 Craft" : "다음 목표" }))}
                columns={[
                  { title: "#", dataIndex: "no", width: 54 },
                  { title: "자원", dataIndex: "label", render: (value, row) => <Space><span className="color-dot" style={{ background: row.color, color: row.color }} /> <Text strong>{value}</Text></Space> },
                  { title: "현재 값", dataIndex: "value", render: (value) => <span className="mono-value">{value}</span> },
                  { title: "가중치", dataIndex: "weight", render: (value) => <Tag color="blue">{value}</Tag> },
                  { title: "계산 대상", dataIndex: "target" },
                  { title: "상태", render: () => <Tag color="green">정상</Tag> },
                ]}
              />
            </>)}

            {activeNav === "upgrades" && workbookFrame("Diamonds", "H12", "=1000 * Upgrade_Power / UNFORMAT_NF(Cost)", <>
              <div className="sheet-summary-row"><Text>Diamond Power는 원본 시트와 동일하게 비용 대비 효과를 비교하는 지표입니다.</Text><Tag color="purple">4개 표시 / 전체 보기 예정</Tag></div>
              <Table className="sheet-table" columns={diamondColumns} dataSource={diamondRows} pagination={false} scroll={{ x: 820 }} />
            </>)}

            {activeNav === "ships" && workbookFrame("Ships", "J8", "=Next_Install_Power / Current_Install_Power", <>
              <div className="sheet-summary-row"><Text>다음 랭크의 곱연산 영향도를 정렬합니다. 오류값은 원본 sentinel 규칙을 유지할 예정입니다.</Text><Tag color="blue">Incr. Power</Tag></div>
              <Table className="sheet-table" columns={shipColumns} dataSource={shipRows} pagination={false} scroll={{ x: 760 }} />
            </>)}

            {activeNav === "mods" && workbookFrame("ModCalc", "N19", "=Priority_Score(affordable, unlocked, ignore, bulk_buy)", <>
              <div className="sheet-summary-row"><Space wrap><Tag color="green">구매 가능</Tag><Tag color="blue">해금됨</Tag><Tag>일괄 구매 반영</Tag></Space><Text type="secondary">추천 순위는 샘플 데이터입니다.</Text></div>
              <Table className="sheet-table" columns={modColumns} dataSource={modRows} pagination={false} rowSelection={{ selectedRowKeys: selectedMods, onChange: setSelectedMods }} scroll={{ x: 760 }} />
              <div className="sheet-footer-note"><ExperimentOutlined /> 실제 구매·가져오기·되돌리기는 아직 연결하지 않았습니다. 계산 엔진 이식 후에만 활성화합니다.</div>
            </>)}

            {activeNav === "settings" && workbookFrame("Named Ranges & Settings", "B4", "=Resource_Weight[Materials]", <>
              <div className="settings-grid">
                <Card size="small" title="추천 엔진 입력값"><Flex vertical gap={14}>{(Object.keys(priority) as ResourceKey[]).map((key) => <Flex key={key} justify="space-between" align="center"><Space><span className="color-dot" style={{ background: resourceMeta[key].color, color: resourceMeta[key].color }} /><Text>{resourceMeta[key].label}</Text></Space><InputNumber min={1} max={100} value={priority[key]} onChange={(value) => setPriority((current) => ({ ...current, [key]: value ?? 1 }))} /></Flex>)}</Flex></Card>
                <Card size="small" title="이식 상태"><Flex vertical gap={12}><Tag color="green">표시용 UI · 완료</Tag><Tag color="blue">CIFI 수식 → TypeScript · 설계됨</Tag><Tag color="gold">MTC 규칙 엔진 · 다음 단계</Tag><Text type="secondary">셀 좌표가 아니라 named key와 버전 데이터로 이식합니다.</Text></Flex></Card>
              </div>
            </>)}
          </div>

          <div className="mobile-nav" role="navigation" aria-label="모바일 메뉴">
            {navItems.slice(0, 5).map((item) => (
              <button key={item.key} className={activeNav === item.key ? "active" : ""} onClick={() => setActiveNav(item.key)}>
                {item.icon}<span>{String(item.label).split(" · ")[0]}</span>
              </button>
            ))}
          </div>
        </Content>
      </Layout>

      <Modal title="시트 진행도 가져오기" open={importOpen} onCancel={() => setImportOpen(false)} onOk={() => { setImportOpen(false); message.success("프로토타입 데이터로 가져오기 미리보기를 생성했습니다."); }} okText="미리보기 생성" cancelText="취소">
        <Paragraph>Google Sheets URL 또는 내보내기 코드를 붙여 넣으세요. 실제 연결 전 단계에서는 형식만 검증합니다.</Paragraph>
        <Input.TextArea rows={4} placeholder="https://docs.google.com/spreadsheets/d/... 또는 CIFI-EXPORT-..." />
        <Checkbox className="modal-checkbox">기존 진행도를 덮어쓰기 전에 변경점을 비교합니다.</Checkbox>
      </Modal>

      <Drawer title="구매 계획" open={cartOpen} onClose={() => setCartOpen(false)} width={440} extra={<Tag color="purple">프로토타입</Tag>}>
        <Flex vertical gap={12}>
          {selectedModRows.map((row, index) => (
            <div className="drawer-item" key={row.key}>
              <Flex justify="space-between" gap={12}>
                <Space align="start"><div className="step-index">{index + 1}</div><div><Text strong>{row.name}</Text><div className="table-subtext">{row.code} · Lv.{row.current} → {row.finish}</div></div></Space>
                <Text className="mono-value">{row.cost}</Text>
              </Flex>
            </div>
          ))}
          <Divider />
          <Flex justify="space-between"><Text>예상 총비용</Text><Title level={4}>3.53e40</Title></Flex>
          <Button type="primary" size="large" block onClick={() => message.info("프로토타입에서는 실제 구매를 실행하지 않습니다.")}>계획 확정</Button>
          <Text type="secondary">실제 엔진 연결 전에는 시트나 게임 데이터를 변경하지 않습니다.</Text>
        </Flex>
      </Drawer>
    </Layout>
  );
}

function PanelTitle({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <Flex align="center" gap={10}>
      <div className="panel-title-icon">{icon}</div>
      <div><div className="panel-title-text">{title}</div><div className="panel-title-sub">{subtitle}</div></div>
    </Flex>
  );
}

export default function Home() {
  return (
    <ConfigProvider
      locale={koKR}
      theme={{
        token: {
          colorPrimary: "#5968e8",
          colorInfo: "#25b9e7",
          colorSuccess: "#37c979",
          colorWarning: "#f4a93a",
          colorError: "#ff5f66",
          borderRadius: 12,
          fontFamily: "var(--font-geist-sans), Pretendard, sans-serif",
          colorText: "#172033",
          colorBgLayout: "#f3f6fb",
        },
        components: {
          Card: { headerBg: "transparent" },
          Table: { headerBg: "#f7f8fb", headerColor: "#697386" },
          Menu: { darkItemBg: "transparent", darkItemSelectedBg: "rgba(127,140,255,.18)", darkItemSelectedColor: "#ffffff" },
          Button: { primaryShadow: "0 8px 20px rgba(89,104,232,.22)" },
        },
      }}
    >
      <AntApp><PrototypeApp /></AntApp>
    </ConfigProvider>
  );
}
