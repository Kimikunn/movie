import AppButton from '../components/AppButton'
import AppInput from '../components/AppInput'
import StatCard from '../components/StatCard'

const ComponentShowcase = () => {
  return (
    <section className="showcase-stack">
      <header>
        <h2>组件示例</h2>
        <p>覆盖默认、悬停、禁用、错误等常用状态。</p>
      </header>

      <div className="showcase-group">
        <h3>按钮</h3>
        <div className="showcase-row">
          <AppButton label="主按钮" />
          <AppButton label="次按钮" tone="neutral" />
          <AppButton label="错误态" state="error" />
          <AppButton label="禁用态" disabled />
        </div>
      </div>

      <div className="showcase-group">
        <h3>输入框</h3>
        <div className="showcase-col">
          <AppInput id="input-default" label="默认输入" placeholder="请输入内容" helperText="支持 2~24 个字符" />
          <AppInput
            id="input-error"
            label="错误输入"
            placeholder="请输入邮箱"
            state="error"
            errorText="邮箱格式不正确"
            defaultValue="invalid@"
          />
          <AppInput id="input-disabled" label="禁用输入" placeholder="不可编辑" disabled />
        </div>
      </div>

      <div className="showcase-group">
        <h3>统计卡片</h3>
        <div className="showcase-row cards">
          <StatCard title="今日票房" value="￥118万" description="较昨日 +12%" />
          <StatCard title="新增用户" value="4,291" description="7日留存 42%" inverse />
        </div>
      </div>
    </section>
  )
}

export default ComponentShowcase
