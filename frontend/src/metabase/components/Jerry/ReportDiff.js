import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CodeDiff from "metabase/components/Jerry/CodeDiff";
import { CardApi, RevisionApi } from "metabase/services";

export default function ReportDiff({ location }) {
  const reportType = location.query.type;
  const r1 = location.query.id1;
  const r2 = location.query.id2;
  const reportId = location.query.report;
  const revision = location.query.revision;
  const [loading, setLoading] = useState(true);
  const [report1Data, setReport1Data] = useState(null);
  const [report2Data, setReport2Data] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const [res1, res2] = await Promise.all([
          CardApi.get({ cardId: r1 }),
          CardApi.get({ cardId: r2 }),
        ]);
        setReport1Data(res1);
        setReport2Data(res2);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchRevision() {
      setLoading(true);
      try {
        const res = await RevisionApi.get({
          cardId: reportId,
          revisionId: revision,
        });
        const cardData = res.card;
        const revisionData = res.revision;
        setReport1Data(revisionData);
        setReport2Data(cardData);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setLoading(false);
      }
    }

    if (reportType === "report") {
      fetchReports();
    } else if (reportType === "report_history_version") {
      fetchRevision();
    }
  }, [reportType, r1, r2, reportId, revision]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          fontSize: "28px",
          fontWeight: "500",
          color: "#8a8787",
        }}
      >
        Loading...
      </div>
    );
  }

  let reportConfig = {
    report_id1: r1,
    report_name1: report1Data?.name,
    report_id2: r2,
    report_name2: report2Data?.name,
  };
  let oldValue = report1Data?.dataset_query?.native?.query;
  let newValue = report2Data?.dataset_query?.native?.query;
  if (reportType === "report_history_version") {
    oldValue = report1Data?.object?.dataset_query?.native?.query;
    newValue = report2Data?.dataset_query?.native?.query;
    reportConfig = {
      report_id1: reportId,
      report_name1: report1Data?.name + ` - ${report1Data?.timestamp}`,
      report_id2: reportId,
      report_name2: report2Data?.name + " - Now",
    };
  }
  return (
    <div>
      <CodeDiff
        diffType={reportType}
        oldValue={oldValue}
        newValue={newValue}
        diffConf={reportConfig}
      />
    </div>
  );
}

ReportDiff.propTypes = {
  location: PropTypes.object,
};
