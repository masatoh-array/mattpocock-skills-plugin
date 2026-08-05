# Codex Plugin

## 目的と変更範囲

このforkは、[mattpocock/skills](https://github.com/mattpocock/skills) のProductivity Agent SkillsをCodex Pluginとして再配布します。

fork元との同期を継続しやすくするため、fork固有の変更では原本の `skills/productivity` を編集しません。

Codex Pluginの `skills` はPluginルート直下の `skills/` に解決する必要があり、リポジトリ内の別の場所を直接参照できません。
そのため、`skills/productivity` を正本とし、GitHub Actionsで `plugins/productivity/skills` へ無変換で複製します。
詳細は[OpenAI公式のPlugin validation仕様](https://developers.openai.com/plugins/deploy/submission-errors#plugin-content-errors)を参照してください。

このforkでは、Codex向けに次のファイルを追加しています。

- `.agents/plugins/marketplace.json`：Marketplace定義
- `plugins/productivity/.codex-plugin/plugin.json`：Plugin manifest
- `plugins/productivity/skills`：Productivity Agent Skillsの生成ミラー
- `.github/workflows/sync-productivity-plugin.yml`：ミラーとversionの同期workflow
- `CODEX_PLUGIN.md`：導入方法と同期手順

`plugins/productivity/skills` は生成物のため、手編集しないでください。
このPluginはCodex専用であり、Cursor対応は行いません。

## 導入

PowerShellで次のコマンドを実行します。

```powershell
codex plugin marketplace add masatoh-array/mattpocock-skills-plugin --ref master
codex plugin add productivity@mattpocock-skills-plugin
```

導入後は、新しいCodexセッションを開始してください。PluginはOSユーザー単位で導入されます。

GitHub上の更新は、インストール済みPluginへ自動では反映されません。

## fork元との同期

fork元の更新とPlugin生成は別の処理です。
`Sync Productivity Codex Plugin` workflowは、fork元のfetchやmergeを行いません。

1. GitHubのSync forkまたは通常のGit操作で、fork元の更新をこのforkの `master` へ取り込みます。
2. `master` の `skills/productivity` と `package.json` に取り込まれた内容を確認します。
3. GitHub Actionsの `Sync Productivity Codex Plugin` を手動実行するか、次回の週次実行を待ちます。
4. workflowの実行結果と、必要に応じて作成された同期commitを確認します。

workflowは `skills/productivity` 直下の全ディレクトリを `plugins/productivity/skills` へ無変換で複製し、`plugin.json` のversionを `package.json` に合わせます。
原本が空の場合は生成先を削除せず失敗し、差分がない場合はcommitしません。
差分がある場合だけ、`plugins/productivity` を `chore: sync productivity Codex plugin` として `master` へcommitします。

## 定期実行

`Sync Productivity Codex Plugin` workflowは毎週月曜09:17（JST）に実行され、GitHub Actions画面から手動でも実行できます。

public forkでは、scheduled workflowを一度有効化する必要があります。
リポジトリに長期間活動がない場合は、再度無効化されることがあります。

## インストール済みPluginの更新

同期commitが `master` に反映された後、Marketplaceを更新してPluginを再導入します。

```powershell
codex plugin marketplace upgrade mattpocock-skills-plugin
codex plugin add productivity@mattpocock-skills-plugin
```

更新後は、新しいCodexセッションを開始してください。
