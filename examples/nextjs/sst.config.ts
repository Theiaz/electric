// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

import { execSync } from "child_process"

export default $config({
  app(input) {
    return {
      name: `nextjs-example`,
      removal: input?.stage === `production` ? `retain` : `remove`,
      home: `aws`,
      providers: {
        cloudflare: `5.42.0`,
        aws: {
          version: `6.57.0`,
        },
        neon: `0.6.3`,
      },
    }
  },
  async run() {
    const project = neon.getProjectOutput({ id: process.env.NEON_PROJECT_ID! })
    const base = {
      projectId: project.id,
      branchId: project.defaultBranchId,
    }

    const db = new neon.Database(`nextjs-example`, {
      ...base,
      name:
        $app.stage === `Production`
          ? `nextjs-production`
          : `nextjs-${$app.stage}`,
      ownerName: `neondb_owner`,
    })

    const databaseUri = getNeonDbUri(project, db, false)
    const databasePooledUri = getNeonDbUri(project, db, true)
    try {
      databaseUri.apply(applyMigrations)

      const electricInfo = databaseUri.apply((uri) =>
        addDatabaseToElectric(uri)
      )

      const website = deployNextJsExample(
        electricInfo,
        databaseUri,
        databasePooledUri
      )
      return {
        databaseUri,
        database_id: electricInfo.id,
        electric_token: electricInfo.token,
        website: website.url,
      }
    } catch (e) {
      console.error(`Failed to deploy nextjs example stack`, e)
    }
  },
})

function applyMigrations(uri: string) {
  execSync(`pnpm exec pg-migrations apply --directory ./db/migrations`, {
    env: {
      ...process.env,
      DATABASE_URL: uri,
    },
  })
}

function deployNextJsExample(
  electricInfo: $util.Output<{ id: string; token: string }>,
  uri: $util.Output<string>,
  pooledUri: $util.Output<string>
) {
  return new sst.aws.Nextjs(`nextjs`, {
    environment: {
      ELECTRIC_URL: process.env.ELECTRIC_API!,
      ELECTRIC_TOKEN: electricInfo.token,
      DATABASE_ID: electricInfo.id,
      DATABASE_URL: uri,
      DATABASE_POOLED_URL: pooledUri,
    },
    domain: {
      name: `nextjs${$app.stage === `production` ? `` : `-stage-${$app.stage}`}.electric-sql.com`,
      dns: sst.cloudflare.dns(),
    },
  })
}

function getNeonDbUri(
  project: $util.Output<neon.GetProjectResult>,
  db: neon.Database,
  pooled: boolean
) {
  const passwordOutput = neon.getBranchRolePasswordOutput({
    projectId: project.id,
    branchId: project.defaultBranchId,
    roleName: db.ownerName,
  })

  const endpoint = neon.getBranchEndpointsOutput({
    projectId: project.id,
    branchId: project.defaultBranchId,
  })

  const databaseHost = pooled
    ? endpoint.endpoints?.apply((endpoints) =>
        endpoints![0].host.replace(
          endpoints![0].id,
          endpoints![0].id + "-pooler"
        )
      )
    : project.databaseHost

  const url = $interpolate`postgresql://${passwordOutput.roleName}:${passwordOutput.password}@${databaseHost}/${db.name}?sslmode=require`
  return url
}

async function addDatabaseToElectric(
  uri: string
): Promise<{ id: string; token: string }> {
  const adminApi = process.env.ELECTRIC_ADMIN_API

  const result = await fetch(`${adminApi}/v1/databases`, {
    method: `PUT`,
    headers: { "Content-Type": `application/json` },
    body: JSON.stringify({
      database_url: uri,
      region: `us-east-1`,
    }),
  })

  if (!result.ok) {
    throw new Error(
      `Could not add database to Electric (${result.status}): ${await result.text()}`
    )
  }

  return await result.json()
}
