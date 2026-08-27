// B"H
export class StrandTension {
  static getTension(strandIdx, totalStrands) {
    return (strandIdx / totalStrands) * 0.5 + 0.5;
  }
}
