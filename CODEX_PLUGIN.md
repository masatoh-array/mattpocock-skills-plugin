# Codex / Cursor Plugins

## 目的と変更範囲

このforkは、[mattpocock/skills](https://github.com/mattpocock/skills) のProductivityおよびEngineering Agent Skillsを、Codex PluginとCursor Pluginとして再配布します。

fork元との同期を継続しやすくするため、fork固有の変更では原本の `skills/productivity` と `skills/engineering` を編集しません。

各Pluginの `skills` はPluginルート直下の `skills/` に解決します。
そのため、`skills/productivity` と `skills/engineering` を正本とし、GitHub Actionsで対応する `plugins/<bucket>/skills` へ複製します。
複製後、Plugin内の各 `agents/openai.yaml` の `display_name` だけに `matt: <bucket>: ` prefixを付けます。
Codexの構造は[OpenAI公式のPlugin validation仕様](https://developers.openai.com/plugins/deploy/submission-errors#plugin-content-errors)、Cursorの構造は[Cursor公式のPlugins reference](https://cursor.com/docs/reference/plugins)に従います。

このforkでは、次のファイルをPlugin配布用に管理します。

- `.agents/plugins/marketplace.json`：Codex Marketplace定義
- `.cursor-plugin/marketplace.json`：Cursor Marketplace定義
- `plugins/productivity`：Productivity Plugin manifestと生成ミラー
- `plugins/engineering`：Engineering Plugin manifestと生成ミラー
- `.github/workflows/sync-plugins.yml`：2つの生成ミラーと4つのmanifest versionを同期するworkflow
- `CODEX_PLUGIN.md`：導入方法と同期手順

`plugins/productivity/skills` と `plugins/engineering/skills` は生成物のため、手編集しないでください。

## Codexへの導入

PowerShellで次のコマンドを実行します。

```powershell
codex plugin marketplace add masatoh-array/mattpocock-skills-plugin --ref master
codex plugin add productivity@mattpocock-skills-plugin
codex plugin add engineering@mattpocock-skills-plugin
```

導入後は、新しいCodexセッションを開始してください。PluginはOSユーザー単位で導入されます。

## Cursorへの導入

PowerShellでMarketplaceを登録します。

```powershell
cursor-agent plugin marketplace add https://github.com/masatoh-array/mattpocock-skills-plugin --git-ref master
```

登録後に `cursor-agent` を起動し、`/plugin` から `productivity` と `engineering` をUser scopeへ個別に導入します。
Cursor CLIには、Pluginを直接導入する非対話コマンドはありません。

GitHub上の更新は、インストール済みPluginへ自動では反映されません。

## fork元との同期

fork元の更新とPlugin生成は別の処理です。
`Sync Codex and Cursor Plugins` workflowは、fork元のfetchやmergeを行いません。

1. GitHubのSync forkまたは通常のGit操作で、fork元の更新をこのforkの `master` へ取り込みます。
2. `master` の `skills/productivity`、`skills/engineering`、`package.json` に取り込まれた内容を確認します。
3. GitHub Actionsの `Sync Codex and Cursor Plugins` を手動実行するか、次回の週次実行を待ちます。
4. workflowの実行結果と、必要に応じて作成された同期commitを確認します。

workflowは両skillバケット直下の全ディレクトリについて、`SKILL.md` と `agents/openai.yaml` の存在を確認してから、対応するPluginの `skills/` へ複製します。
その後、Plugin側の `display_name` にbucket別prefixを付けます。
また、4つのCodex/Cursor manifestのversionを `package.json` に合わせます。
どちらかの原本が空の場合は生成先を削除せず失敗し、差分がない場合はcommitしません。
差分がある場合だけ、Claude manifestと2つのPlugin生成物を `chore: sync Codex and Cursor plugins` として `master` へcommitします。

## 定期実行

`Sync Codex and Cursor Plugins` workflowは毎週月曜09:17（JST）に実行され、GitHub Actions画面から手動でも実行できます。

public forkでは、scheduled workflowを一度有効化する必要があります。
リポジトリに長期間活動がない場合は、再度無効化されることがあります。

## インストール済みPluginの更新

同期commitが `master` に反映された後、Marketplaceを更新します。

CodexではMarketplace更新後、両Pluginを再導入します。

```powershell
codex plugin marketplace upgrade mattpocock-skills-plugin
codex plugin add productivity@mattpocock-skills-plugin
codex plugin add engineering@mattpocock-skills-plugin
```

CursorではMarketplaceを更新し、`cursor-agent` 内の `/plugin` から両Pluginを更新します。

```powershell
cursor-agent plugin marketplace update https://github.com/masatoh-array/mattpocock-skills-plugin
```

更新後は、新しいCodexセッションまたはCursorセッションを開始してください。
