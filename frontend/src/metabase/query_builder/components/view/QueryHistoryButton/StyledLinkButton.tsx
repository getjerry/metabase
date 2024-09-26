import styled from "@emotion/styled";
import Link from "metabase/core/components/Link/Link";
import { color } from "metabase/lib/colors";

export const StyledLinkButton = styled(Link)`
  color: ${color("brand")};
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: ${color("bg-white")};

  :hover {
    background-color: ${color("bg-light")};
  }
`;
