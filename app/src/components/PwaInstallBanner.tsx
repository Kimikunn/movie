import { IonIcon } from '@ionic/react'
import { arrowDownCircleOutline, closeOutline, shareSocialOutline } from 'ionicons/icons'
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt'

const PwaInstallBanner = () => {
  const { canShowPrompt, dismissPrompt, installMode, promptInstall } = usePwaInstallPrompt()

  if (!canShowPrompt || !installMode) {
    return null
  }

  const isPromptMode = installMode === 'prompt'
  const title = isPromptMode ? '安装到主屏' : '添加到主屏幕'
  const description = isPromptMode
    ? '安装后可以像原生 App 一样启动，并保留更稳定的离线体验。'
    : '请在 Safari 里点分享按钮，再选择“添加到主屏幕”，后续可直接从桌面打开。'

  return (
    <section className="install-banner" aria-label="安装应用提示">
      <div className="install-banner-copy">
        <p>{title}</p>
        <strong>{description}</strong>
      </div>

      <div className="install-banner-actions">
        {isPromptMode ? (
          <button type="button" className="install-banner-primary" onClick={() => void promptInstall()}>
            <IonIcon icon={arrowDownCircleOutline} />
            <span>立即安装</span>
          </button>
        ) : (
          <div className="install-banner-hint" aria-hidden="true">
            <IonIcon icon={shareSocialOutline} />
            <span>分享</span>
          </div>
        )}

        <button type="button" className="install-banner-dismiss" aria-label="关闭安装提示" onClick={dismissPrompt}>
          <IonIcon icon={closeOutline} />
        </button>
      </div>
    </section>
  )
}

export default PwaInstallBanner
