import { Link, useSearchParams } from 'react-router-dom'

type TabVariant = 'liquid' | 'segmented' | 'orb' | 'minimal'

const tabExamples: Array<{ id: TabVariant; name: string; desc: string }> = [
  {
    id: 'liquid',
    name: 'Liquid Glass',
    desc: '液态玻璃胶囊，整体最接近 iOS26 的高级质感与动效逻辑。',
  },
  {
    id: 'segmented',
    name: 'Segmented Frost',
    desc: '分段式毛玻璃，更稳重，点击区域和文案都更清晰。',
  },
  {
    id: 'orb',
    name: 'Center Orb',
    desc: '中间操作强调型，新增按钮视觉权重更高，适合创作流。',
  },
  {
    id: 'minimal',
    name: 'Minimal Rail',
    desc: '极简白底轨道，干净克制，适合 monochrome 信息密度界面。',
  },
]

const TabLabPage = () => {
  const [searchParams] = useSearchParams()
  const selected = (searchParams.get('tab') as TabVariant) || 'liquid'

  return (
    <section className="tab-lab-page">
      <header className="tab-lab-head">
        <p>IOS26 TAB LAB</p>
        <h2>底部 Tab 范例</h2>
      </header>

      <div className="tab-lab-list">
        {tabExamples.map((item) => (
          <Link
            key={item.id}
            className={`tab-lab-item ${selected === item.id ? 'is-active' : ''}`}
            to={`/preview/tab-lab?tab=${item.id}`}
          >
            <strong>{item.name}</strong>
            <span>{item.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default TabLabPage
