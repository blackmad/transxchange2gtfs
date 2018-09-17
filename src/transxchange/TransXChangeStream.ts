import {JourneyPatternSections, JourneyStop, Operators, StopPoint, TransXChange} from "./TransXChange";
import {Transform, TransformCallback} from "stream";
import autobind from "autobind-decorator";
import {ATCOCode} from "../reference/NaPTAN";

/**
 * Transforms JSON objects into a TransXChange objects
 */
@autobind
export class TransXChangeStream extends Transform {

  constructor() {
    super({ objectMode: true });
  }

  /**
   * Extract the stops, journeys and operators and emit them as a TransXChange object
   */
  public _transform(data: any, encoding: string, callback: TransformCallback): void {
    const tx = data.TransXChange;

    this.push({
      StopPoints: tx.StopPoints[0].AnnotatedStopPointRef.map(this.getStop),
      JourneySections: tx.JourneyPatternSections[0].JourneyPatternSection.reduce(this.getJourneySections, {}),
      Operators: tx.Operators[0].Operator.reduce(this.getOperators, {})
    });

    callback();
  }

  private getStop(stop: any): StopPoint {
    return {
      StopPointRef: stop.StopPointRef[0],
      CommonName: stop.CommonName[0],
      LocalityName: stop.LocalityName[0],
      LocalityQualifier: stop.LocalityQualifier[0]
    };
  }

  private getJourneySections(index: JourneyPatternSections, section: any): JourneyPatternSections {
    index[section.$.id] = section.JourneyPatternTimingLink.map((l: any) => ({
      From: this.getJourneyStop(l.From[0]),
      To: this.getJourneyStop(l.To[0]),
      RunTime: l.RunTime[0]
    }));

    return index;
  }

  private getJourneyStop(stop: any): JourneyStop {
    return {
      Activity: stop.Activity[0],
      StopPointRef: stop.StopPointRef[0],
      WaitTime: stop.WaitTime && stop.WaitTime[0]
    };
  }

  private getOperators(index: Operators, operator: any): Operators {
    index[operator.$.id] = {
      OperatorCode: operator.OperatorCode[0],
      OperatorShortName: operator.OperatorShortName[0],
      OperatorNameOnLicence: operator.OperatorNameOnLicence && operator.OperatorNameOnLicence[0],
    };

    return index;
  }

}